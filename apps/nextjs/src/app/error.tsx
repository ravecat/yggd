"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#dc2626" }}
      >
        Error Loading Todos
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "1rem" }}>
        {error.message}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
