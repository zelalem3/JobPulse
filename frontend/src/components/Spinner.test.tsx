import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("renders without label", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Spinner label="Loading jobs..." />);
    expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
  });
});