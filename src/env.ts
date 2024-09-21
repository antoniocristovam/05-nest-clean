import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number).optional().default("3333"),
});

export type Env = z.infer<typeof envSchema>;
