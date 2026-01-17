import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { alvinModel, MAX_OUTPUT_TOKENS } from "~/lib/ai/config";
import { ALVIN_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import { auth } from "~/server/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = (await req.json()) as {
    messages: UIMessage[];
  };

  const result = streamText({
    model: alvinModel,
    system: ALVIN_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  // CRITICAL: Ensure stream completes even if client disconnects
  result.consumeStream();

  return result.toUIMessageStreamResponse();
}
