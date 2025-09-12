import React from "react";
import { Card, CardContent, CardHeader } from "./Card";
import AddBalanceDialog from "./AddBalanceDialog";
import AgentList from "./AgentList";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    EqualsIcon,
} from "@phosphor-icons/react/dist/ssr";
import { getWalletGGr } from "@/actions/carteiras";
import { twMerge } from "tailwind-merge";

const formatCurrencyBRL = (value: number): string =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

const parseWalletBalance = (value?: string): number => {
    if (!value) return 0;

    const cleaned = value.trim().replace(/[^0-9.,-]/g, "");

    if (!cleaned) return 0;

    if (cleaned.includes(".") && cleaned.includes(",")) {
        const lastComma = cleaned.lastIndexOf(",");
        const lastDot = cleaned.lastIndexOf(".");

        if (lastComma > lastDot) {
            return (
                parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0
            );
        } else {
            return parseFloat(cleaned.replace(/,/g, "")) || 0;
        }
    }

    if (cleaned.includes(",")) {
        return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
    }

    if (cleaned.includes(".")) {
        const dots = (cleaned.match(/\./g) || []).length;
        if (dots > 1) {
            const parts = cleaned.split(".");
            const decimal = parts.pop();
            const integer = parts.join("");
            return parseFloat(`${integer}.${decimal}`) || 0;
        }
        return parseFloat(cleaned) || 0;
    }

    return parseFloat(cleaned) || 0;
};

const GgrBadge = async ({
    idBadge,
    id,
    saldo,
}: {
    idBadge: number;
    id: string;
    saldo: number;
}) => {
    try {
        const ggrTable = (await getWalletGGr(idBadge)) as GgrTableProps[];

        if (!ggrTable || !Array.isArray(ggrTable)) {
            return null;
        }

        const getGgrRate = (balance: number): number => {
            const sortedLevels = [...ggrTable].sort(
                (a, b) => parseFloat(b.above) - parseFloat(a.above)
            );

            for (const level of sortedLevels) {
                if (balance >= parseFloat(level.above)) {
                    return level.tax;
                }
            }
            return 0;
        };

        const ggrRate = getGgrRate(saldo);

        if (ggrRate <= 0) {
            return null;
        }

        return (
            <div
                id={id}
                className="bg-primary text-background-primary rounded py-1 px-2 text-xs font-medium"
                role="status"
                aria-label={`Taxa GGR atual: ${ggrRate}%`}
            >
                GGR Atual: {ggrRate}%
            </div>
        );
    } catch (error) {
        console.error("Error fetching GGR data:", error);
        return null;
    }
};

const TARGET_BALANCE = 100;

const Carteira = async ({
    carteira,
    index,
}: {
    carteira: WalletProps;
    index: number;
}) => {
    const saldo = parseWalletBalance(carteira.saldo);
    const progress = Math.min((saldo / TARGET_BALANCE) * 100, 100);

    const { totalGanhos, totalPerdidos } = carteira.agents.reduce(
        (acc, agent) => {
            const winAmount = parseWalletBalance(agent.win);
            const totalAmount = parseWalletBalance(agent.total);

            return {
                totalGanhos: acc.totalGanhos + winAmount,
                totalPerdidos:
                    acc.totalPerdidos +
                    (totalAmount < 0 ? Math.abs(totalAmount) : 0),
            };
        },
        { totalGanhos: 0, totalPerdidos: 0 }
    );

    const isDisabled = carteira.status !== 1;

    console.log(carteira);

    return (
        <Card className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}>
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <h3 className="font-bold text-base">{carteira.name}</h3>
                    <GgrBadge
                        id={`wallet-badge-${index}`}
                        idBadge={carteira.id}
                        saldo={saldo}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <section
                    id={`wallet-saldo-${carteira.id}`}
                    className="space-y-2"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm text-foreground/70 font-medium">
                            Saldo:
                        </h4>
                        <div className="flex gap-1 text-foreground/50">
                            <span className="font-bold">
                                {formatCurrencyBRL(saldo)}
                            </span>
                            <span className="">
                                / {formatCurrencyBRL(TARGET_BALANCE)}
                            </span>
                        </div>
                    </div>

                    <div
                        className="w-full bg-foreground/20 h-1.5 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progresso do saldo: ${progress.toFixed(
                            1
                        )}%`}
                    >
                        {progress > 0 && (
                            <div
                                style={{ width: `${progress}%` }}
                                className="h-full bg-[#95BD2B] transition-all duration-300 ease-in-out"
                            />
                        )}
                    </div>
                </section>

                <section
                    id={`wallet-apostas-${index}`}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="space-y-1">
                        <p className="text-sm text-foreground/70 font-medium">
                            Apostas Perdidas
                        </p>
                        <div className="flex gap-2 items-center">
                            {totalPerdidos > 0 ? (
                                <>
                                    <ArrowDownIcon
                                        weight="bold"
                                        className="text-[#E53935]"
                                        aria-hidden="true"
                                    />
                                    <p className="text-base font-bold text-[#E53935]">
                                        - {formatCurrencyBRL(totalPerdidos)}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <EqualsIcon
                                        className="text-foreground/50"
                                        aria-hidden="true"
                                    />
                                    <p className="text-base font-bold text-foreground/50">
                                        R$ 0,00
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-foreground/70 font-medium">
                            Apostas Ganhas
                        </p>
                        <div className="flex gap-2 items-center">
                            {totalGanhos > 0 ? (
                                <>
                                    <ArrowUpIcon
                                        weight="bold"
                                        className="text-[#95BD2B]"
                                        aria-hidden="true"
                                    />
                                    <p className="text-base font-bold text-[#95BD2B]">
                                        + {formatCurrencyBRL(totalGanhos)}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <EqualsIcon
                                        className="text-foreground/50"
                                        aria-hidden="true"
                                    />
                                    <p className="text-base font-bold text-foreground/50">
                                        R$ 0,00
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section
                    id={`wallet-agents-${index}`}
                    className="border-t border-foreground/10 pt-4"
                >
                    <AgentList agents={carteira.agents || []} />
                </section>

                <section className="flex w-full gap-4">
                    <AddBalanceDialog
                        walletId={carteira.id}
                        walletType={carteira.id}
                        triggerClassName={twMerge(
                            "w-full",
                            isDisabled ? "opacity-50 cursor-not-allowed " : ""
                        )}
                    />
                    {/* <Button
                        variant="secondary"
                        disabled={isDisabled}
                        className={
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }
                    >
                        Ver Jogos
                    </Button> */}
                </section>
            </CardContent>
        </Card>
    );
};

export default Carteira;
