"use client";
import React, { useEffect, useState } from "react";
import Carteira from "@/components/Carteira";
import PaginationControls from "@/components/PaginationControls";
import AddBalanceDialog from "@/components/AddBalanceDialog";
import { useSearchParams } from "next/navigation";
import { getAllWalletsData } from "@/actions/carteiras";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const CarteirasClient = ({
    carteirasData,
    carteiras,
}: {
    carteirasData: WalletResponseProps;
    carteiras: WalletProps[];
}) => {
    const searchParams = useSearchParams();
    const provedor = searchParams.get("provedor");
    const [showAddBalanceDialog, setShowAddBalanceDialog] = useState(false);
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(
        null
    );
    const [allCarteiras, setAllCarteiras] = useState<WalletProps[]>([]);

    // Buscar todas as carteiras quando há um parâmetro provedor
    useEffect(() => {
        const fetchAllCarteiras = async () => {
            if (provedor) {
                try {
                    const allWalletsData = await getAllWalletsData();
                    setAllCarteiras(allWalletsData?.data || []);
                } catch (error) {
                    console.error("Error loading all carteiras:", error);
                }
            }
        };

        fetchAllCarteiras();
    }, [provedor]);

    const filteredWallet = allCarteiras.find((carteira) =>
        carteira.provedores.some((p) => p.id.toString() === provedor)
    );

    useEffect(() => {
        if (provedor && filteredWallet && allCarteiras.length > 0) {
            setSelectedWalletId(filteredWallet.id);
            setShowAddBalanceDialog(true);
        }
    }, [provedor, filteredWallet, allCarteiras.length]);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Pacotes</h2>
                {provedor && (
                    <div className="text-sm text-foreground/70">
                        Filtrado por provedor: {provedor}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0">
                {carteiras.map((carteira, i) => (
                    <div key={carteira.id} id={`carteira-${i}`}>
                        <Carteira
                            index={(carteirasData.from || 1) - 1 + i + 1}
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
                searchParams={Object.fromEntries(searchParams.entries())}
            />

            {showAddBalanceDialog && selectedWalletId && (
                <Dialog
                    open={showAddBalanceDialog}
                    onOpenChange={setShowAddBalanceDialog}
                >
                    <DialogContent className="sm:max-w-xl bg-background-primary max-h-[85vh] overflow-y-auto">
                        <DialogTitle className="text-lg font-bold mb-4">
                            Adicionar Saldo para Habilitar Jogo
                        </DialogTitle>

                        <p className="text-sm text-foreground/70 mb-4">
                            Para habilitar este jogo, você precisa adicionar
                            saldo na carteira do provedor correspondente.
                        </p>
                        <div className="space-y-4">
                            <AddBalanceDialog
                                walletId={selectedWalletId}
                                walletType={selectedWalletId}
                                triggerClassName="w-full"
                            />
                            <button
                                onClick={() => setShowAddBalanceDialog(false)}
                                className="w-full px-4 py-2 border border-foreground/20 rounded-md hover:bg-foreground/5"
                            >
                                Cancelar
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </section>
    );
};

export default CarteirasClient;
