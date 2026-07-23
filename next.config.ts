import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // page 1은 영구적으로 /blog에 존재. 라우팅 레이어에서 308로 넘긴다.
      { source: "/blog/page/1", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
