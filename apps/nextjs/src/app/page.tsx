interface Post {
  id: string;
  type: string;
  attributes: {
    title: string;
    content: string;
    author_id: string;
    created_at?: string;
    updated_at?: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

interface User {
  id: string;
  type: string;
  attributes: {
    email: string;
  };
}

async function getPosts(): Promise<{
  posts: Post[];
  users: Map<string, User>;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(
      `${apiUrl}/api/posts?page[limit]=10&sort=-created_at`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const jsonApiData = await response.json();

    const users = new Map<string, User>();

    if (jsonApiData.included) {
      jsonApiData.included.forEach((item: User) => {
        if (item.type === "user") {
          users.set(item.id, item);
        }
      });
    }

    return {
      posts: jsonApiData.data || [],
      users,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], users: new Map() };
  }
}

export default async function Index() {
  const { posts, users } = await getPosts();

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
