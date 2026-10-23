// The root layout: the <html> and <body> that wrap every page (here, just
// page.tsx). Next.js requires this file. It also loads the global stylesheets,
// including Leaflet's own CSS, without which map tiles render scattered.
import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velomap",
  description: "Cycling route planner with GPX export",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
