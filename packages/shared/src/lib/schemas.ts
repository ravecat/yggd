import { z } from 'zod';

export const User = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const Post = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  author: z.string().optional(),
});

export const schemas = {
  post: z.array(Post),
  user: z.array(User),
} as const;


