import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";

import BuyInfluencerDialog from "@/components/BuyInfluencerDialog";
import { Metadata } from "next";
import { getWalletsData } from "@/actions/carteiras";
import { getSignatureData } from "@/actions/signature";
import { getOrdersData } from "@/actions/orders";

import { redirect } from "next/navigation";
import CarteirasClient from "./CarteirasClient";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
    title: "Pacotes",
    description: "Pacotes do sistema",
};

interface PacotesPageProps {
    searchParams: Promise<{ page?: string; orders_page?: string }>;
}

export default async function pacotesPage({ searchParams }: PacotesPageProps) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || "1", 10);
    const ordersPage = parseInt(params.orders_page || "1", 10);

    try {
        const [carteirasData, pedidos, signatureData] = await Promise.all([
            getWalletsData(currentPage) as Promise<WalletResponseProps>,
            getOrdersData(ordersPage),
            getSignatureData() as Promise<SignatureResponse>,
        ]);

        const carteiras = carteirasData.data;

        return (
            <main className="space-y-8">
                <CarteirasClient
                    carteirasData={carteirasData}
                    carteiras={carteiras}
                />

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Outras Informações</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <Card id="influencers-section">
                                <CardHeader>
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex gap-2">
                                            <Icon>
                                                <StarIcon />
                                            </Icon>
                                            <span className="text-xl font-bold">
                                                Influencers
                                            </span>
                                        </div>

                                        <BuyInfluencerDialog
                                            signatureData={signatureData}
                                            triggerClassName=""
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-foreground/70">
                                            Preço por influencer: R${" "}
                                            {signatureData.prices.inf}
                                        </p>
                                        <p className="text-sm text-foreground/70">
                                            Agentes disponíveis:{" "}
                                            {signatureData.agentes.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <OrdersClient pedidos={pedidos} />
                    </div>
                </div>
            </main>
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("Sessão expirada")
        ) {
            redirect("/login");
        }

        throw error;
    }
}
