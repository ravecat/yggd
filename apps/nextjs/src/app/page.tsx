import { getPosts, type User } from "@yggd/shared";

export default async function Index() {
  const jsonApiData = await getPosts();

  const posts = jsonApiData.data || [];
  const users = new Map<string, User>();

  if (jsonApiData.included) {
    jsonApiData.included.forEach((item) => {
      if (item.type === "user") {
        users.set(item.id, item as User);
      }
    });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-gray-900">Latest Posts</h1>

      {posts.length === 0 ? (
        <p className="text-lg text-gray-600">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => {
            const author = post.relationships?.author?.data?.id
              ? users.get(post.relationships.author.data.id)
              : null;

            return (
              <article
                key={post.id}
                className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-2xl mb-2 text-gray-900">
                  {post.attributes.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  By: {author?.attributes.email || "Unknown"}
                  {post.attributes.created_at && (
                    <>
                      {" "}
                      •{" "}
                      {new Date(
                        post.attributes.created_at
                      ).toLocaleDateString()}
                    </>
                  )}
                </p>
                <p className="leading-relaxed text-gray-700">
                  {post.attributes.content.substring(0, 200)}
                  {post.attributes.content.length > 200 ? "..." : ""}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
