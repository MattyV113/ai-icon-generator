import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const generateRouter = createTRPCRouter({
  generateIcon: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      console.log(input.prompt);
      return {
        message: "Success",
      };
    }),
});
