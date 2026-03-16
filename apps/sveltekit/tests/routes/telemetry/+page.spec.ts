import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TelemetryPage from "../../../src/routes/telemetry/+page.svelte";

describe("src/routes/telemetry/+page.svelte", () => {
  it("renders the telemetry pathname", () => {
    render(TelemetryPage);

    expect(screen.getByText("/telemetry")).toBeTruthy();
  });
});
