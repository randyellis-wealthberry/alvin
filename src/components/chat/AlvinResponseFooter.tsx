"use client";

import {
  ResponseFooter,
  type ResponseFooterComponent,
} from "@thesysai/genui-sdk";

export const AlvinResponseFooter: ResponseFooterComponent = ({
  messageId,
  threadId,
}) => {
  return (
    <ResponseFooter.Container>
      <ResponseFooter.ThumbsUpButton
        onClick={() => {
          console.log(
            `[ALVIN Feedback] Thumbs up — message: ${messageId}, thread: ${threadId}`,
          );
        }}
      />
      <ResponseFooter.ThumbsDownButton
        onClick={() => {
          console.log(
            `[ALVIN Feedback] Thumbs down — message: ${messageId}, thread: ${threadId}`,
          );
        }}
      />
    </ResponseFooter.Container>
  );
};
