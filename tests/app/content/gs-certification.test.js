// GS 인증 페이지에 표시되는 단계와 AI 리포트 데이터의 무결성을 확인합니다.
import { describe, expect, it } from "vitest";
import { aiReports, steps } from "../../../app/data/gs-certification.js";

describe("GS 인증 콘텐츠 데이터", () => {
  it("각 단계의 ID가 중복되지 않는다", () => {
    const ids = steps.map(({ id }) => id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 AI 리포트에 필수 상세 정보가 존재한다", () => {
    expect(aiReports.length).toBeGreaterThan(0);

    // 리포트 화면에 필요한 주요 필드가 하나라도 비어 있는지 확인합니다.
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
