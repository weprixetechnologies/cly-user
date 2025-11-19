import { Ledger, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/Footer";
import Preloader from "@/components/ui/preloader";
import ReduxProvider from "@/components/providers/ReduxProvider";
import DisableContextMenu from "@/components/providers/DisableContextMenu";
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
  description: "Welcome to CLY, India's largest stationary point for imported items. We are your one-stop destination for quality stationary products, offering a wide range of imported goods that meet the highest standards of quality and reliability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ledger.variable} ${montserrat.variable} antialiased`}
      >
        <ReduxProvider>
          <DisableContextMenu />
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
