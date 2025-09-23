"use client";
import React from "react";
import Order from "@/components/Order";
import { useSearchParams } from "next/navigation";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import PaginationControls from "@/components/PaginationControls";

const OrdersClient = ({ pedidos }: { pedidos: OrderResponseProps }) => {
    const searchParams = useSearchParams();

    return (
        <section>
            <Card id="transactions-section">
                <CardHeader>
                    <Icon>
                        <ShoppingCartIcon />
                    </Icon>
                    <span className="text-xl font-bold">Compras Recentes</span>
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
                    searchParams={Object.fromEntries(searchParams.entries())}
                    paramKey="orders_page"
                    compact
                    hideWhenSinglePage={false}
                />
            </Card>
        </section>
    );
};

export default OrdersClient;
