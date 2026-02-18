import { z } from "zod";

export const topUpSchema = z.object({
  userId: z.string().uuid(),
  assetName: z.enum(["Gold Coins", "Diamonds", "Loyalty Points"]),
  amount: z.number().positive(),
  referenceId: z.string().min(5),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
