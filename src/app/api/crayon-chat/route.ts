import { streamText } from "ai";
import { alvinModel, MAX_OUTPUT_TOKENS } from "~/lib/ai/config";
import { analyzeConversationForCheckIn } from "~/lib/ai/check-in-detection";
import { ALVIN_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { makeC1Response } from "@thesysai/genui-sdk/server";
import { chatRateLimit } from "~/server/api/rate-limit";

interface PromptMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * Extract plain text from C1Chat's XML-wrapped prompt format.
 * C1Chat sends messages like: `<content thesys="true">Hello ALVIN</content>`
 * We need to extract just "Hello ALVIN" for the LLM.
 */
function extractTextFromPrompt(content: string): string {
  if (!content) return "";

  // Try to extract content from <content ...>...</content> tags
  const match = /<content[^>]*>([\s\S]*?)<\/content>/i.exec(content);
  if (match?.[1]) {
    return match[1].trim();
  }

  // Fallback: return as-is if no XML wrapper
  return content.trim();
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limit: 20 messages per minute per user
  const { success } = await chatRateLimit.limit(session.user.id);
  if (!success) {
    return new Response("Rate limit exceeded. Please slow down.", {
      status: 429,
    });
  }

  const body = (await req.json()) as {
    prompt: PromptMessage;
    responseId: string;
    threadId: string;
  };

  const { prompt, threadId } = body;
  console.log("[crayon-chat] Request:", {
    threadId,
    promptRole: prompt?.role,
    promptContent: prompt?.content?.slice(0, 100),
  });

  // Verify user profile
  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    console.error("[crayon-chat] Profile not found for user:", session.user.id);
    return new Response("Profile not found", { status: 404 });
  }

  // Verify conversation ownership
  const conversation = await db.conversation.findUnique({
    where: {
      id: threadId,
      userProfileId: profile.id,
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    console.error("[crayon-chat] Conversation not found:", {
      threadId,
      profileId: profile.id,
    });
    return new Response("Conversation not found", { status: 404 });
  }

  // Build message history from DB + the new user message
  const historyMessages = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Extract the actual text from the C1Chat XML-wrapped prompt
  const userMessageText = extractTextFromPrompt(prompt.content);

  // Only add the message if it has content
  if (userMessageText) {
    historyMessages.push({ role: "user", content: userMessageText });
  }

  // Use makeC1Response for C1Chat-compatible rich streaming
  // Order: writeThinkItem → writeCustomMarkdown → end
  const { responseStream, writeThinkItem, writeCustomMarkdown, end } =
    makeC1Response();

  // Process the stream in the background
  void (async () => {
    try {
      console.log("[crayon-chat] Starting Claude stream with", {
        messageCount: historyMessages.length,
        lastMessage: historyMessages[historyMessages.length - 1]?.content?.slice(
          0,
          100,
        ),
      });

      // Show thinking state while Claude processes (ephemeral = disappears after response)
      await writeThinkItem({
        title: "Reflecting on your message",
        description: "ALVIN is considering how you're doing...",
        ephemeral: true,
      });

      // Stream from Claude
      const result = streamText({
        model: alvinModel,
        system: ALVIN_SYSTEM_PROMPT,
        messages: historyMessages,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });

      // Accumulate the full response for markdown rendering
      let fullResponse = "";
      for await (const chunk of result.textStream) {
        fullResponse += chunk;
      }
      console.log(
        "[crayon-chat] Stream complete, length:",
        fullResponse.length,
      );

      // Write as custom markdown — this wraps in XML that C1Chat can parse
      await writeCustomMarkdown(fullResponse);
      await end();

      // Persist the new user message (use extracted text, not raw XML-wrapped content)
      if (userMessageText) {
        await db.message.create({
          data: {
            conversationId: threadId,
            role: "user",
            content: userMessageText,
          },
        });
      }

      // Persist assistant response
      await db.message.create({
        data: {
          conversationId: threadId,
          role: "assistant",
          content: fullResponse,
        },
      });

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      // Check-in detection
      const messagesForAnalysis = [
        ...historyMessages,
        { role: "assistant" as const, content: fullResponse },
      ];
      const checkInResult = analyzeConversationForCheckIn(messagesForAnalysis);

      if (checkInResult.shouldCheckIn && !conversation.checkInId) {
        const checkIn = await db.checkIn.create({
          data: {
            userProfileId: profile.id,
            method: "CONVERSATION",
          },
        });

        await db.conversation.update({
          where: { id: threadId },
          data: { checkInId: checkIn.id },
        });

        await db.userProfile.update({
          where: { id: profile.id },
          data: { lastCheckInAt: new Date() },
        });

        console.log(`Check-in recorded via conversation: ${checkIn.id}`);
      }
    } catch (error: unknown) {
      console.error("[crayon-chat] Stream error:", error);
      try {
        await writeCustomMarkdown(
          "Sorry, something went wrong. Please try again.",
        );
        await end();
      } catch {
        // Stream already closed
      }
    }
  })();

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
