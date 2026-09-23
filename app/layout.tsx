import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
    title: "Dikota - Workspace OS",
    description: "Enterprise project management and workflow platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className="h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased overflow-hidden font-sans">
                <Providers>
                    <AppShell>
                        {children}
                    </AppShell>
                </Providers>
            </body>
        </html>
    );
}