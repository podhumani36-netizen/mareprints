import { Playfair_Display, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";
import "./globals.css";
import Header from "./layout/header";
import Footer from "./layout/footer";
import { CartProvider } from "./context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Mare Prints",
  description: "Premium Prints & Posters",
    icons: {
    icon: "/favicon.ico",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
            strategy="afterInteractive"
          />
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </CartProvider>
      </body>
    </html>
  );
}
