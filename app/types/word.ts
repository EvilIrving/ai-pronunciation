import { z } from "zod";

export const WordSchema = z.object({
  id: z.string().uuid(),
  word: z.string().min(1),
  definition: z.string().min(1),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});

export type Word = z.infer<typeof WordSchema>;

export const WordsArraySchema = z.array(WordSchema);
