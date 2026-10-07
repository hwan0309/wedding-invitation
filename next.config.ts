import type { NextConfig } from "next";

// Next.js 기본 HTML-limited 봇 목록 + 국내 메신저/검색 스크래퍼.
// 이 목록에 없는 봇은 메타데이터를 <body>로 스트리밍 받기 때문에
// 카카오톡 링크 미리보기(og:image, og:title)가 비어 보일 수 있다.
// (카카오톡·다음·라인 인앱 브라우저로 접속한 하객과 겹치지 않도록 스크래퍼 이름만 넣는다)
const HTML_LIMITED_BOTS =
  /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|kakaotalk-scrap|Daumoa|TelegramBot/i;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  htmlLimitedBots: HTML_LIMITED_BOTS,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
