import { getPostsId } from "@yggd/shared";
import { notFound } from "next/navigation";
import { Modal } from "@/shared/ui/modal";

export default async function PostModal({
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
    <Modal title={post.attributes?.title}>
      <article className="prose max-w-none">
        {post.attributes?.created_at && (
          <time className="text-xs text-gray-500 mb-4 block">
            {new Date(post.attributes.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}

        <div className="mt-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
          {post.attributes?.content}
        </div>
      </article>
    </Modal>
  );
}
