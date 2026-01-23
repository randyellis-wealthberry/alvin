"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

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
    <div className="w-full max-w-sm rounded-[2rem] bg-white/5 p-1 backdrop-blur-sm">
      <div className="rounded-[1.8rem] border border-white/5 bg-background/50 p-6 shadow-xl">
        {latestPost ? (
          <div className="mb-4 rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Most Recent Status</p>
            <p className="mt-1 truncate text-lg font-semibold text-primary">{latestPost.name}</p>
          </div>
        ) : (
          <p className="mb-4 text-center text-sm text-muted-foreground">No recent status updates.</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isInputEmpty) return;
            setError(null);
            createPost.mutate({ name });
          }}
          className="flex flex-col gap-3"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Update status..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              className="h-12 border-white/10 bg-black/20 text-base backdrop-blur-md focus-visible:ring-primary/50"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full text-base"
            disabled={createPost.isPending || isInputEmpty}
          >
            {createPost.isPending ? "Updating..." : "Post Status"}
          </Button>
        </form>
      </div>
    </div>
  );
}
