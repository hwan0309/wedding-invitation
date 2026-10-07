import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/config";
import { DISPLAY_FONT_HREF } from "@/lib/invitation/themes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | 모바일 청첩장`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: "ko_KR",
    type: "website",
    title: `${SITE.name} | 모바일 청첩장`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="stylesheet" href={DISPLAY_FONT_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
