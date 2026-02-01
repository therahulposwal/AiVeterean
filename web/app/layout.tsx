import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google"; // ✅ Import Nunito Sans
import "./globals.css";

// Configure the font
const nunito = Nunito_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"], // Load necessary weights
  variable: "--font-nunito",
});

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
      <body className={`${nunito.className} antialiased bg-stone-50 text-stone-900`}>
        {children}
      </body>
    </html>
  );
}