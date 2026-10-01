import { Ledger, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/Footer";
import Preloader from "@/components/ui/preloader";
import ReduxProvider from "@/components/providers/ReduxProvider";
import DisableContextMenu from "@/components/providers/DisableContextMenu";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Script from 'next/script';

const ledger = Ledger({
  variable: "--font-ledger",
  subsets: ["latin"],
  weight: "400",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Cursive Letters Ly",
  description: "Welcome to CLY, India's largest stationary point for imported items. We are your one-stop destination for quality stationary products, offering a wide range of imported goods that meet the highest standards of quality and reliability.",
  verification: {
    google: "gn2DNHluONpfF8NTB9Lu1gfLJEbNyAbrS2JobvvK6FI",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-VF1JL9BLNC"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VF1JL9BLNC');
            `,
          }}
        />
      </head>
      <body
        className={`${ledger.variable} ${montserrat.variable} antialiased`}
      >
        <ReduxProvider>
          <DisableContextMenu />
          <Preloader />
          <Header />
          <main className="">
            {children}
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
