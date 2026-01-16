"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to create post. Please try again.");
    },
  });

  const isInputEmpty = name.trim().length === 0;

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isInputEmpty) return;
          setError(null);
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={createPost.isPending || isInputEmpty}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
