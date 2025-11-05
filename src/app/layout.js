import { Ledger, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/Footer";
import Preloader from "@/components/ui/preloader";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  description: "Shop for Beautiful Cursive Letters at Cursive Letters. We offer a wide range of Cursive Letters for all your needs. Buy Cursive Letters online at the best price. Cursive Letters are a great way to add a personal touch to your home or office. Cursive Letters are a great way to add a personal touch to your home or office.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ledger.variable} ${montserrat.variable} antialiased`}
      >
        <ReduxProvider>
          <Preloader />
          <Header></Header>
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
