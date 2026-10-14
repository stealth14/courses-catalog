"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Post } from "@/models/post";

type PostCache = {
  posts: Post[] | null;
  setPosts: (posts: Post[]) => void;
};

const PostCacheContext = createContext<PostCache | null>(null);

export function PostCacheProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const value = { posts, setPosts };

  return (
    <PostCacheContext.Provider value={value}>
      {children}
    </PostCacheContext.Provider>
  );
}

export function usePostCache() {
  const context = useContext(PostCacheContext);

  if (!context) {
    throw new Error("usePostCache must be used within a PostCacheProvider.");
  }

  return context;
}
