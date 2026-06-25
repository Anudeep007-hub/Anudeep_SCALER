import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Clone",
  description: "Signal-style messaging frontend",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
