import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Auth App - Secure Authentication",
  description: "Experience next-generation authentication with Passkeys and 2FA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="animated-bg" />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
