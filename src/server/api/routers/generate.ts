/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { TRPCContextProps } from "@trpc/react-query/shared";

import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";

const configuration = new Configuration({
  apiKey: env.DALLE_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateIcon(prompt: string): Promise<string | undefined> {
  if (env.MOCK_DALLE === "true") {
    return "https://oaidalleapiprodscus.blob.core.windows.net/private/org-UeKMfRuAzHoxZvYPQnJDkT03/user-JyZEeF2qRohpPcEErMEUcmLX/img-hP8Sv5W4smbQxnCtiTakiWev.png?st=2023-08-11T17%3A17%3A03Z&se=2023-08-11T19%3A17%3A03Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-08-11T17%3A17%3A27Z&ske=2023-08-12T17%3A17%3A27Z&sks=b&skv=2021-08-06&sig=UPtqNbz629upFWi3kypaX3PpNH/KzuPJk6uhQRDAllI%3D";
  } else {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data.data[0]?.url;
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

      const url = await generateIcon(input.prompt);

      return {
        message: "Success",
        imageUrl: url,
      };
    }),
});
