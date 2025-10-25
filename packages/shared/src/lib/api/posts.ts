import { deserialize } from '../utils/serializer.js';

export async function getPosts() {
  const response = await fetch(
    `${process.env.PUBLIC_API_URL}/api/posts?page[limit]=10&sort=-created_at`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  const data = await response.json();

  return deserialize('post', data);
}