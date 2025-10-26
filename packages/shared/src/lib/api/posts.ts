import axios from 'axios';
import { deserialize } from '../utils/serializer.js';

export async function getPosts() {
  const response = await axios.get(
    `${process.env.PUBLIC_API_URL}/api/posts?page[limit]=10&sort=-created_at`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      }
    }
  );

  return deserialize('post', response.data);
}