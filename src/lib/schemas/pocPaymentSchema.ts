import { z } from "zod";

export const PocPaymentRequestSchema = z.object({
  cardNumber: z.string().min(1),
});

export type PocPaymentRequest = z.infer<typeof PocPaymentRequestSchema>;
