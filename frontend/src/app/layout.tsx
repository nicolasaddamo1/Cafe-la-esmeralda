import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/Footer";
import { ProductProvider } from "@/context/product.context";
import { AuthProvider } from "@/context/auth.context";
import { CartProvider } from "@/context/cart.context";
import { CategoryProvider } from "@/context/categories.context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Esmeralda",
  description: "La Esmeralda es una tienda de café en línea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/cafe.ico" />
      </head>
      <body className={`${inter.className} h-min-screen`}>
        <AuthProvider>
          <CategoryProvider>
            <ProductProvider>
              <CartProvider>
                <Navbar />
                {children}
                <div className="fixed bottom-6 right-6 z-50">
                <Link href="https://api.whatsapp.com/send?phone=541158803709">
                  <button  className="bg-primary hover:bg-teal-800 text-white rounded-full py-5 px-5 shadow-xl w-20 h-20">
                  <FontAwesomeIcon icon={faWhatsapp} style={{width: "26px", height: "26px"}}/>
                  </button>
                </Link>
              </div>
                <Footer />
              </CartProvider>
            </ProductProvider>
          </CategoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
