import type { Metadata, Viewport } from "next";
import { Google_Sans } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/lib/theme";
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
  themeColor: "#f0eee9",
  colorScheme: "light dark",
};

const themeInitializationScript = `(function(){try{var theme=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(theme==="dark")document.documentElement.classList.add("dark")}catch(error){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${googleSans.variable} min-w-80 bg-cloud-dancer dark:bg-dark-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-dvh bg-cloud-dancer font-(family-name:--font-google-sans) text-slate-900 antialiased selection:bg-primary selection:text-white dark:bg-dark-background dark:text-cloud-dancer">
        {children}
      </body>
    </html>
  );
}
