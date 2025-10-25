import { getPosts, type User, type Post } from "@yggd/shared";

export default async function Index() {
  const jsonApiData = await getPosts();

  const posts = jsonApiData.data || [];
  const users = new Map<string, User>();

  if (jsonApiData.included) {
    jsonApiData.included.forEach((item) => {
      if (item.type === "user" && item.id) {
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
            const authorRelation = post.relationships?.author;
            const authorId =
              authorRelation &&
              "data" in authorRelation &&
              authorRelation.data &&
              typeof authorRelation.data === "object" &&
              "id" in authorRelation.data
                ? authorRelation.data.id
                : null;
            const author = authorId ? users.get(authorId) : null;

            const attrs = post.attributes as Post["attributes"];
            const authorAttrs = author?.attributes as User["attributes"];

            return (
              <article
                key={post.id}
                className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-2xl mb-2 text-gray-900">{attrs?.title}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  By: {authorAttrs?.email || "Unknown"}
                  {attrs?.created_at && (
                    <> • {new Date(attrs.created_at).toLocaleDateString()}</>
                  )}
                </p>
                <p className="leading-relaxed text-gray-700">
                  {attrs?.content && typeof attrs.content === "string" ? (
                    <>
                      {attrs.content.substring(0, 200)}
                      {attrs.content.length > 200 ? "..." : ""}
                    </>
                  ) : null}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
