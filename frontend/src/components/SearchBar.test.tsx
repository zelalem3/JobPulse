import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("renders with default placeholder", () => {
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText("Search for anything...")
    ).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(<SearchBar placeholder="Search jobs..." />);
    expect(screen.getByPlaceholderText("Search jobs...")).toBeInTheDocument();
  });

  it("calls onSearch when typing", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search for anything...");
    await user.type(input, "Laravel");

    expect(onSearch).toHaveBeenCalled();
    expect(onSearch).toHaveBeenLastCalledWith("Laravel");
  });

  it("clears input and calls onSearch with empty string", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search for anything...");
    await user.type(input, "React");
    // Clear button appears when query is non-empty
    const clearBtn = screen.getByRole("button");
    await user.click(clearBtn);

    expect(input).toHaveValue("");
    expect(onSearch).toHaveBeenLastCalledWith("");
  });
});