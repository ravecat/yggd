import { getPosts } from "@yggd/shared";

export default async function Index() {
  const posts = await getPosts();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-gray-900">Latest Posts</h1>

      {posts.length === 0 ? (
        <p className="text-lg text-gray-600">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl mb-2 text-gray-900">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4">
                {post.created_at && (
                  <> • {new Date(post.created_at).toLocaleDateString()}</>
                )}
              </p>
              <p className="leading-relaxed text-gray-700">
                {post.content ? (
                  <>
                    {post.content.substring(0, 200)}
                    {post.content.length > 200 ? "..." : ""}
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
