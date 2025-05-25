import { IBM_Plex_Mono, Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const ibm_plex_mono = IBM_Plex_Mono({
  weight: ["400", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
