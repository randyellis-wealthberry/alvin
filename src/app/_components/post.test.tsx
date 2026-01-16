import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the tRPC hooks
const mockMutate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    post: {
      getLatest: {
        useSuspenseQuery: vi.fn(() => [null]),
      },
      create: {
        useMutation: vi.fn((options) => ({
          mutate: (input: { name: string }) => {
            mockMutate(input);
            // Simulate success by default
            if (options?.onSuccess) {
              options.onSuccess();
            }
          },
          isPending: false,
        })),
      },
    },
    useUtils: vi.fn(() => ({
      post: {
        invalidate: mockInvalidate,
      },
    })),
  },
}));

import { LatestPost } from "./post";

describe("LatestPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with input and button", () => {
    render(<LatestPost />);

    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("shows 'You have no posts yet' when no posts exist", () => {
    render(<LatestPost />);

    expect(screen.getByText("You have no posts yet.")).toBeInTheDocument();
  });

  it("disables submit button when input is empty", () => {
    render(<LatestPost />);

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
  });

  it("enables submit button when input has text", () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "My Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).not.toBeDisabled();
  });

  it("calls mutate on form submission", async () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "Test Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ name: "Test Post" });
    });
  });

  it("clears input on successful submission", async () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("does not submit when input is only whitespace", () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "   " } });

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
  });
});
