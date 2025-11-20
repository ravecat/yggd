import { getPostsId } from "@yggd/shared";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getPostsId(id);
  const post = response.data;

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
      >
        ← Back to posts
      </Link>

      <h1 className="text-4xl font-bold mb-6">
        {post.attributes?.title || "Untitled"}
      </h1>

      {post.attributes?.created_at && (
        <time className="text-sm text-gray-600 mb-8 block">
          {new Date(post.attributes.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div className="mt-8 text-gray-800 whitespace-pre-wrap leading-relaxed">
        {post.attributes?.content}
      </div>
    </div>
  );
}
