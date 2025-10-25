import type { CollectionResourceDoc } from 'jsonapi-typescript';

export async function getPosts(): Promise<CollectionResourceDoc> {
  const response = await fetch(
    `${process.env.PUBLIC_API_URL}/api/posts?page[limit]=10&sort=-created_at`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    } as RequestInit & { cache?: string }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  return response.json() as Promise<CollectionResourceDoc>;
}
