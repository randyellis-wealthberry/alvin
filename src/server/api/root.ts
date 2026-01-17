import { alertRouter } from "~/server/api/routers/alert";
import { checkInRouter } from "~/server/api/routers/checkin";
import { contactRouter } from "~/server/api/routers/contact";
import { conversationRouter } from "~/server/api/routers/conversation";
import { passkeyRouter } from "~/server/api/routers/passkey";
import { postRouter } from "~/server/api/routers/post";
import { profileRouter } from "~/server/api/routers/profile";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  alert: alertRouter,
  checkIn: checkInRouter,
  contact: contactRouter,
  conversation: conversationRouter,
  passkey: passkeyRouter,
  post: postRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
