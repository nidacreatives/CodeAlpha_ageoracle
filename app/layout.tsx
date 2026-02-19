import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Age Calculator — Powered by Supabase",
  description: "Calculate your age with live stats and zodiac insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#021A20" }}>
        {children}
      </body>
    </html>
  );
}
