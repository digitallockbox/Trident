import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GradientTitle from "../../src/components/ui/GradientTitle";

describe("GradientTitle", () => {
  it("renders the text", () => {
    render(<GradientTitle text="Hello Trident" />);
    expect(screen.getByText("Hello Trident")).toBeInTheDocument();
  });

  it("uses default md size class", () => {
    render(<GradientTitle text="Default" />);
    const el = screen.getByText("Default");
    expect(el.className).toContain("text-3xl");
  });

  it("applies lg size class", () => {
    render(<GradientTitle text="Large" size="lg" />);
    const el = screen.getByText("Large");
    expect(el.className).toContain("text-4xl");
  });

  it("applies sm size class", () => {
    render(<GradientTitle text="Small" size="sm" />);
    const el = screen.getByText("Small");
    expect(el.className).toContain("text-xl");
  });

  it("applies gradient classes", () => {
    render(<GradientTitle text="Gradient" />);
    const el = screen.getByText("Gradient");
    expect(el.className).toContain("bg-gradient-to-r");
    expect(el.className).toContain("text-transparent");
    expect(el.className).toContain("bg-clip-text");
  });
});
