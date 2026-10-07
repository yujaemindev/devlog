import { describe, expect, it } from "vitest";
import { aiReports, steps } from "../app/data/gs-certification.js";

describe("GS certification content", () => {
  it("uses unique IDs for each step", () => {
    const ids = steps.map(({ id }) => id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides complete details for every AI report", () => {
    expect(aiReports.length).toBeGreaterThan(0);

    for (const report of aiReports) {
      expect(report.title).toBeTruthy();
      expect(report.metric).toBeTruthy();
      expect(report.target).toBeTruthy();
      expect(report.result).toBeTruthy();
      expect(report.samples).toBeTruthy();
      expect(report.file).toBeTruthy();
    }
  });
});