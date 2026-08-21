import { ReduxProvider } from "@/store/ReduxProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatWithMe - Modern Messaging",
  description: "Connect instantly, chat seamlessly with ChatWithMe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className='min-h-screen flex flex-col'>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
