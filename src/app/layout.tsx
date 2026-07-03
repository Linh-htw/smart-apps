import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nina Wolff Shop-App",
  description: "Interne Shop- und Kundenmanagement-App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
