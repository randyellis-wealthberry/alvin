"use client";

import { useState, type FormEvent } from "react";

interface MessageInputProps {
  onSend: (message: { text: string }) => void;
  disabled: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend({ text: input.trim() });
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 rounded-lg border p-3 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </form>
  );
}
