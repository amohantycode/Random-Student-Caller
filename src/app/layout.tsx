import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Student Picker",
  description: "Randomly pick students without repeats.",
  openGraph: {
    title: "Student Picker",
    description: "Randomly pick students without repeats.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Student Picker — Fair turns. Less fuss." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Picker",
    description: "Randomly pick students without repeats.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
