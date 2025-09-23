"use client";
import React from "react";
import Carteira from "@/components/Carteira";
import PaginationControls from "@/components/PaginationControls";
import { useSearchParams } from "next/navigation";

const CarteirasClient = ({
    carteirasData,
    carteiras,
}: {
    carteirasData: WalletResponseProps;
    carteiras: WalletProps[];
}) => {
    const searchParams = useSearchParams();

    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold ">Pacotes</h2>
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
        </section>
    );
};

export default CarteirasClient;
