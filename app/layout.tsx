import type { Metadata, Viewport } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  weight: "variable",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Lấy Link — Tạo link hoa hồng Shopee & TikTok",
  description:
    "Tạo link affiliate Shopee và TikTok Shop nhanh chóng, miễn phí và minh bạch.",
  applicationName: "Lấy Link",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lấy Link" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b7a5a",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${googleSans.variable} min-w-80 bg-[#f8fbfa]`}>
      <body className="min-h-screen bg-[#f8fbfa] font-[family-name:var(--font-google-sans)] text-[#101828] antialiased selection:bg-[#0b7a5a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
