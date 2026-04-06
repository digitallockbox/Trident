import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "../../src/components/layout/Layout";

describe("Layout", () => {
  it("renders children", () => {
    render(
      <Layout>
        <p>Test content</p>
      </Layout>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders the Trident branding", () => {
    render(
      <Layout>
        <div />
      </Layout>,
    );

    expect(screen.getByText(/Trident/)).toBeInTheDocument();
  });

  it("contains a main element for content", () => {
    const { container } = render(
      <Layout>
        <p>inside main</p>
      </Layout>,
    );

    const main = container.querySelector("main");
    expect(main).toBeTruthy();
    expect(main!.textContent).toContain("inside main");
  });
});
