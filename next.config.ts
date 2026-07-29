import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // subset-font는 harfbuzz WASM을 require.resolve로 로드한다. 번들되면 Turbopack이
  // 그 경로를 모듈 ID(숫자)로 치환해 fs.readFile가 깨진다. 외부 패키지로 유지한다.
  serverExternalPackages: ["subset-font"],
  async redirects() {
    return [
      // page 1은 영구적으로 /blog에 존재. 라우팅 레이어에서 308로 넘긴다.
      { source: "/blog/page/1", destination: "/blog", permanent: true },
      // 슬러그 오타 정정 전 URL. 배포된 외부 링크·SEO 보존을 위해 308로 넘긴다.
      {
        source: "/projects/moneyturmy",
        destination: "/projects/moneytermi",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
