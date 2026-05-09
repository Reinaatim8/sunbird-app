import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunbird AI Pipeline",
  description:
    "Transcribe, summarise, translate, and synthesise speech in Ugandan languages — powered by Sunbird AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
