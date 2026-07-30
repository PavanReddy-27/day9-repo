// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChartContainer from "./ChartContainer.tsx";

describe("ChartContainer", () => {
  it("renders an empty state with a retry action", () => {
    const onRetry = vi.fn();

    render(
      <ChartContainer
        title="Workforce Trend"
        empty
        onRetry={onRetry}
      >
        <div>Chart content</div>
      </ChartContainer>
    );

    expect(
      screen.getByText("No data available for this chart.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /retry/i })
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders an error state with a retry button", () => {
    const onRetry = vi.fn();

    render(
      <ChartContainer
        title="Department Distribution"
        error="Unable to load chart data."
        onRetry={onRetry}
      >
        <div>Chart content</div>
      </ChartContainer>
    );

    expect(
      screen.getByText("Unable to load chart data.")
    ).toBeInTheDocument();

    const retryButtons = screen.getAllByRole("button", { name: /retry/i });
    fireEvent.click(retryButtons[retryButtons.length - 1]);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
