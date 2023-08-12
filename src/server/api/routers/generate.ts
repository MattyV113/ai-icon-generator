/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { TRPCContextProps } from "@trpc/react-query/shared";

import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";
import { b64Image } from "../data/b64";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

const configuration = new Configuration({
  apiKey: env.DALLE_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateIcon(prompt: string): Promise<string | undefined> {
  if (env.MOCK_DALLE === "true") {
    return b64Image;
  } else {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
    });

    return response.data.data[0]?.b64_json;
  }
}

export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.prisma.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1,
          },
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });

      if (count <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You do not have enough credits.",
        });
      }

      const icon = await ctx.prisma.icon.create({
        data: {
          prompt: input.prompt,
          userId: ctx.session.user.id,
        },
      });

      const url = await generateIcon(input.prompt);

      await s3
        .putObject({
          Bucket: "icons-with-ai",
          Body: Buffer.from(url!, "base64"),
          Key: icon.id,
          ContentEncoding: "base64",
          ContentType: "image/png",
        })
        .promise();

      return {
        imageUrl: url,
      };
    }),
});
