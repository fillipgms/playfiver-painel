import { Card, CardContent, CardHeader } from "@/components/Card";
import Carteira from "@/components/Carteira";
import Icon from "@/components/Icon";
import { ShoppingCartIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import Order from "@/components/Order";
import BuyInfluencerDialog from "@/components/BuyInfluencerDialog";
import { Metadata } from "next";
import { getWalletsData } from "@/actions/carteiras";
import { getSignatureData } from "@/actions/signature";
import { getOrdersData } from "@/actions/orders";
import PaginationControls from "@/components/PaginationControls";
import { redirect } from "next/navigation";

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
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold ">Pacotes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0">
                        {carteiras.map((carteira, i) => (
                            <div key={carteira.id} id={`carteira-${i}`}>
                                <Carteira
                                    index={
                                        (carteirasData.from || 1) - 1 + i + 1
                                    }
                                    carteira={carteira}
                                />
                            </div>
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={carteirasData.current_page}
                        lastPage={carteirasData.last_page}
                        hasNextPage={!!carteirasData.next_page_url}
                        hasPrevPage={!!carteirasData.prev_page_url}
                        baseUrl="/pacotes"
                        searchParams={params}
                    />
                </section>
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

                        <section>
                            <Card id="transactions-section">
                                <CardHeader>
                                    <Icon>
                                        <ShoppingCartIcon />
                                    </Icon>
                                    <span className="text-xl font-bold">
                                        Compras Recentes
                                    </span>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {pedidos.data.map((order: OrderProps) => (
                                        <Order key={order.id} order={order} />
                                    ))}
                                </CardContent>

                                <PaginationControls
                                    currentPage={pedidos.current_page}
                                    lastPage={pedidos.last_page}
                                    hasNextPage={!!pedidos.next_page_url}
                                    hasPrevPage={!!pedidos.prev_page_url}
                                    baseUrl="/pacotes"
                                    searchParams={params}
                                    paramKey="orders_page"
                                    compact
                                    hideWhenSinglePage={false}
                                />
                            </Card>
                        </section>
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
