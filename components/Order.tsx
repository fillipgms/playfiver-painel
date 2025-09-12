import { StarIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import React from "react";
import { twMerge } from "tailwind-merge";

const Order = ({ order }: { order: OrderProps }) => {
    return (
        <div className="flex justify-between items-center py-2 px-4 relative">
            <div
                className={twMerge(
                    "absolute left-0 top-0 w-1 h-full",
                    order.type === "Influencer"
                        ? "bg-[#00B2C2]"
                        : "bg-[#95BD2B]"
                )}
            ></div>

            <div className="flex items-center gap-2">
                <div
                    className={twMerge(
                        "p-2 rounded-full",
                        order.type === "Influencer"
                            ? "bg-[#00B2C2]/20 text-[#00B2C2]"
                            : "bg-[#95BD2B]/20 text-[#95BD2B]"
                    )}
                >
                    {order.type === "Influencer" ? <StarIcon /> : <PlusIcon />}
                </div>
                <div>
                    <h3 className="font-medium">
                        {order.type === "Influencer"
                            ? "Conta Influencer"
                            : `Recarga ${order.wallet}`}
                    </h3>
                    <p className="text-xs text-foreground/50">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </div>

            <p
                className={twMerge(
                    "text-sm font-bold",
                    order.type === "Influencer"
                        ? "text-[#00B2C2]"
                        : "text-[#95BD2B]"
                )}
            >
                R$ {order.amount}
            </p>
        </div>
    );
};

export default Order;
