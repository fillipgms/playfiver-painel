import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Termos de Serviço",
    description: "Termos de Serviço da PlayFiver",
};

export default function TermosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
