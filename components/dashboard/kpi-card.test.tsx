import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { deltaOf, formatDelta, KpiCard } from "@/components/dashboard/kpi-card";

// Runs in a real Chromium (the "browser" Vitest project), with the app's
// stylesheet loaded — see test/browser-setup.ts.

function renderCard(delta: number | null) {
  return render(
    <KpiCard
      label="Revenue"
      value="$1,234.00"
      delta={delta}
      hint="vs. previous 30 days"
      icon={CurrencyDollarIcon}
    />,
  );
}

describe("KpiCard", () => {
  it("shows the label, value and period", async () => {
    const screen = await renderCard(12.5);

    await expect.element(screen.getByText("Revenue")).toBeVisible();
    await expect.element(screen.getByText("$1,234.00")).toBeVisible();
    // A regex, not a string: the hint shares its element with the trend badge
    // ("+12.5%vs. previous 30 days"), and a string locator must match an
    // element's whole text. (Testing Library matched own text nodes only.)
    await expect.element(screen.getByText(/vs\. previous 30 days/)).toBeVisible();
  });

  it("marks a rise as an upward trend", async () => {
    const screen = await renderCard(12.5);
    const trend = screen.getByText("+12.5%");

    await expect.element(trend).toHaveAttribute("data-trend", "up");
    await expect.element(trend).toHaveClass("text-success");
  });

  it("marks a fall as a downward trend", async () => {
    const screen = await renderCard(-4);
    const trend = screen.getByText("-4.0%");

    await expect.element(trend).toHaveAttribute("data-trend", "down");
    await expect.element(trend).toHaveClass("text-destructive");
  });

  it("colours a fall differently from a rise", async () => {
    // Only checkable in a real browser: jsdom applies no stylesheet, so both
    // would report the same (empty) colour.
    const colourOf = async (delta: number) => {
      const screen = await renderCard(delta);
      const el = screen.getByText(formatDelta(delta)).element();
      return getComputedStyle(el).color;
    };

    expect(await colourOf(12.5)).not.toBe(await colourOf(-4));
  });

  it("treats no change as flat-to-up, not down", async () => {
    const screen = await renderCard(0);

    await expect
      .element(screen.getByText("+0.0%"))
      .toHaveAttribute("data-trend", "up");
  });

  it("omits the trend when there's nothing to compare against", async () => {
    const screen = await renderCard(null);

    expect(screen.container.querySelector("[data-trend]")).toBeNull();
    // The period still explains what the figure covers.
    await expect
      .element(screen.getByText("vs. previous 30 days"))
      .toBeVisible();
  });
});

describe("deltaOf", () => {
  it("is the percent change between windows", () => {
    expect(deltaOf(150, 100)).toBe(50);
    expect(deltaOf(50, 100)).toBe(-50);
  });

  it("is null against an empty previous window", () => {
    expect(deltaOf(4800, 0)).toBeNull();
  });
});

describe("formatDelta", () => {
  it("signs and rounds to one decimal", () => {
    expect(formatDelta(12.345)).toBe("+12.3%");
    expect(formatDelta(-0.06)).toBe("-0.1%");
  });
});
