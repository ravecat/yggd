import type { ResourceObject } from 'jsonapi-typescript';

export type Post = ResourceObject<
  'post',
  {
    title: string;
    content: string;
    author_id: string;
    created_at?: string;
    updated_at?: string;
  }
>;

export type User = ResourceObject<
  'user',
  {
    email: string;
  }
>;
