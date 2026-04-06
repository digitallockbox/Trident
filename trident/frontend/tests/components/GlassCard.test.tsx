import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GlassCard from "../../src/components/ui/GlassCard";

describe("GlassCard", () => {
  it("renders title and children", () => {
    render(
      <GlassCard title="Test Title">
        <p>Card content</p>
      </GlassCard>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies glass-card className", () => {
    const { container } = render(
      <GlassCard title="Glass">
        <span>inner</span>
      </GlassCard>,
    );

    expect(container.querySelector(".glass-card")).toBeTruthy();
  });
});
