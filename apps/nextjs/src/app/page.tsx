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
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#1a1a1a" }}
      >
        Latest Posts
      </h1>

      {posts.length === 0 ? (
        <p style={{ fontSize: "1.1rem", color: "#666" }}>No posts yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {posts.map((post) => {
            const author = post.relationships?.author?.data?.id
              ? users.get(post.relationships.author.data.id)
              : null;

            return (
              <article
                key={post.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.75rem",
                    marginBottom: "0.5rem",
                    color: "#1a1a1a",
                  }}
                >
                  {post.attributes.title}
                </h2>
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
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
                <p style={{ lineHeight: "1.6", color: "#333" }}>
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
