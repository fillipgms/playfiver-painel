import "./globals.css";
import localFont from "next/font/local";

import { Metadata, Viewport } from "next";
import { SessionProvider } from "@/contexts/SessionContext";

const selawik = localFont({
    src: [
        { path: "../public/font/selawkl.woff", weight: "300", style: "normal" },
        { path: "../public/font/selawk.woff", weight: "350", style: "normal" },
        {
            path: "../public/font/selawksb.woff",
            weight: "600",
            style: "normal",
        },
        { path: "../public/font/selawkb.woff", weight: "700", style: "normal" },
    ],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Playfiver",
        template: "%s | Playfiver",
    },
    description: "Dashboard do sistema",
    applicationName: "Playfiver",
    keywords: ["Playfiver", "dashboard", "painel"],
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        title: "Playfiver",
        description: "Dashboard do sistema",
        type: "website",
        locale: "pt_BR",
        url: "https://playfiver.com.br",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "Playfiver",
            },
        ],
    },
    alternates: {
        canonical: "/",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#0b0b0b",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body
                className={`${selawik.className} antialiased bg-background-secondary text-foreground`}
            >
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
