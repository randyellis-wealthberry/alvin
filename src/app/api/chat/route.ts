import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { alvinModel, MAX_OUTPUT_TOKENS } from "~/lib/ai/config";
import { analyzeConversationForCheckIn } from "~/lib/ai/check-in-detection";
import { ALVIN_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    messages,
    conversationId,
  }: {
    messages: UIMessage[];
    conversationId: string;
  } = (await req.json()) as {
    messages: UIMessage[];
    conversationId: string;
  };

  // Verify conversation ownership
  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return new Response("Profile not found", { status: 404 });
  }

  const conversation = await db.conversation.findUnique({
    where: {
      id: conversationId,
      userProfileId: profile.id,
    },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const result = streamText({
    model: alvinModel,
    system: ALVIN_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  // CRITICAL: Ensure stream completes even if client disconnects
  result.consumeStream();

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      // Save the latest user + assistant message pair
      const lastMessages = finalMessages.slice(-2);

      for (const msg of lastMessages) {
        const content = msg.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");

        await db.message.create({
          data: {
            conversationId,
            role: msg.role,
            content,
          },
        });
      }

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Check-in detection: analyze if user confirmed wellness
      const messagesForAnalysis = finalMessages.map((m) => ({
        role: m.role,
        content: m.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join(""),
      }));

      const checkInResult = analyzeConversationForCheckIn(messagesForAnalysis);

      if (checkInResult.shouldCheckIn && !conversation.checkInId) {
        // Record check-in (conversation method)
        const checkIn = await db.checkIn.create({
          data: {
            userProfileId: profile.id,
            method: "CONVERSATION",
          },
        });

        // Link conversation to check-in
        await db.conversation.update({
          where: { id: conversationId },
          data: { checkInId: checkIn.id },
        });

        // Update user's last check-in timestamp
        await db.userProfile.update({
          where: { id: profile.id },
          data: { lastCheckInAt: new Date() },
        });

        console.log(`Check-in recorded via conversation: ${checkIn.id}`);
      }
    },
  });
}
