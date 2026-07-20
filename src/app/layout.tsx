import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Look Closer — An Immersive Exhibition",
  description:
    "A cinematic art experience that notices where your attention lingers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
