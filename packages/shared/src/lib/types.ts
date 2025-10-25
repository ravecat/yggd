import { z } from 'zod';
import { User, Post } from './schemas.js';

export type User = z.infer<typeof User>;
export type Post = z.infer<typeof Post>;

export type Resources = {
  post: Post;
  user: User;
};

export type ResourceType = keyof Resources;
