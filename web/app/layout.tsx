import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veer AI | Veteran Profiler",
  description: "Military to Civilian Transition Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
