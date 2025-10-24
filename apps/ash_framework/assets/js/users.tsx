import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { listUsers, getByEmail } from "./ash_generated";

const queryClient = new QueryClient();

const UserList = () => {
  const [searchEmail, setSearchEmail] = useState("");

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await listUsers({
        fields: ["id", "email"],
        page: { limit: 50 },
      });

      if (result.success) {
        return (
          result.data as unknown as {
            results: Array<{ id: string; email: string }>;
          }
        ).results;
      }

      const errorMsg =
        "errors" in result
          ? result.errors[0]?.message || "Failed to load users"
          : "Failed to load users";
      throw new Error(errorMsg);
    },
  });

  const handleSearch = async () => {
    if (!searchEmail) return;

    try {
      const result = await getByEmail({
        input: { email: searchEmail },
        fields: ["id", "email"],
      });

      if (result.success) {
        console.log("Found user:", result.data);
        alert(`Found: ${result.data.email} (ID: ${result.data.id})`);
      } else {
        const errorMsg =
          "errors" in result
            ? result.errors[0]?.message || "User not found"
            : "User not found";
        console.error("Search failed:", errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error occurred");
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <div className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UsersPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Users Management
            </h1>
            <p className="text-lg text-slate-600">
              Browse and search users using type-safe RPC functions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <UserList />
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

const container = document.getElementById("users-app");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <UsersPage />
    </React.StrictMode>,
  );
}
