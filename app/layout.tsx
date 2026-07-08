import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cartStore";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MaintenanceScreen } from "@/components/ui/MaintenanceScreen";
import { getMaintenanceMode } from "@/lib/actions/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panela Cheia Supermercado",
  description: "Faça seu pedido online e receba em casa ou retire na loja.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  // Admin sempre acessível (é lá que se desliga o modo manutenção) e a confirmação de um
  // pedido já feito também não deve travar, mesmo que a manutenção seja ligada logo depois.
  const isGated = !pathname.startsWith("/admin") && !pathname.startsWith("/pedido");
  const maintenanceMode = isGated && (await getMaintenanceMode());

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <Header />
          <main className="flex-1">{maintenanceMode ? <MaintenanceScreen /> : children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
