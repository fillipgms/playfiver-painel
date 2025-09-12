import "./globals.css";
import "./font.css";

import { Metadata } from "next";
import { SessionProvider } from "@/contexts/SessionContext";

export const metadata: Metadata = {
    title: "Playfiver",
    description: "Dashboard do sistema",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body
                className={`antialiased bg-background-secondary text-foreground`}
            >
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
