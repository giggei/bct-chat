import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BayernCloud Tourismus Experte",
  description: "Stelle Fragen zur BayernCloud Tourismus",
  icons: {
    icon: "/bayern.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {assistantId ? children : <Warnings />}
        <img className="logo" src="/bayern.svg" alt="Bayern Logo" />
      </body>
    </html>
  );
}
