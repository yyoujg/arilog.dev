import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// dev 서버로 실행한다. 하이드레이션 불일치·잘못된 DOM 중첩 경고는 React가
// development 모드에서만 콘솔에 내보내므로, prod 빌드로는 잡을 수 없다.
export default defineConfig({
  testDir: "./e2e",
  timeout: 300_000, // 콜드 dev 서버는 라우트별 on-demand 컴파일로 느릴 수 있다.
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // 콘솔 메시지 귀속을 명확히 하고 dev 서버 과부하를 피한다.
  forbidOnly: !!process.env.CI,
  // list: 콘솔 진행 상황. html: 실패 시 CI 아티팩트로 올릴 리포트(playwright-report/).
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
