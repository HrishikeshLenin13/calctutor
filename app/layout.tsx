import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import Link from "next/link";
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = { title: "CalcTutor", description: "Type a class problem and follow the TI-84 Plus CE keys for that problem, one step at a time." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${geist.variable} ${mono.variable}`}><body><SiteNav />{children}<footer className="site-footer"><div className="footer-inner"><Link className="brand" href="/"><span>CalcTutor</span></Link><p>CalcTutor is an independent educational project and is not affiliated with, endorsed by, or sponsored by Texas Instruments. TI-84 Plus CE is a trademark of Texas Instruments.</p></div></footer></body></html> }
