import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "JobRec - AI-Powered Job Recommendations",
  description: "Find your perfect tech job with AI-powered recommendations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}