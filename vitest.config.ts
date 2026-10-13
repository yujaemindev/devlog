import { defineConfig } from "vitest/config";

// 기본 테스트는 간단한 요약을 표시합니다.
// 상세 결과는 npm run test:verbose의 CLI 옵션으로만 활성화합니다.
export default defineConfig({
  test: {
    reporters: ["default"],
  },
});
