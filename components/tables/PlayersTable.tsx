"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePlayer } from "@/actions/players";
import { twMerge } from "tailwind-merge";
import { MagnifyingGlassIcon, StarIcon } from "@phosphor-icons/react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PlayerProps {
    id: number;
    username: string;
    saldo: string;
    valor_debitado: string;
    valor_ganho: string;
    rtp: string;
    is_influencer: number;
    atk: string;
    token: string;
    agentCode: string;
    status: string;
}

const cols: ColDef<PlayerProps>[] = [
    {
        headerName: "Jogador",
        field: "username",
        flex: 1,
        minWidth: 150,
        pinned: "left",

        cellRenderer: (p: ICellRendererParams) => {
            const { atk, username, status } = p.data;
            const isOnline = status !== "off";

            return (
                <div className="flex flex-col h-full w-full justify-center">
                    <div className="flex gap-1 items-center">
                        <p className="leading-none">{username}</p>
                        <div
                            className={twMerge(
                                "size-1 rounded-full",
                                isOnline ? "bg-[#a4e100]" : "bg-foreground/50"
                            )}
                        />
                    </div>
                    <p className="text-xs text-foreground/50 truncate">{atk}</p>
                </div>
            );
        },
    },
    {
        headerName: "Tipo",
        field: "is_influencer",
        flex: 1,
        minWidth: 130,
        valueFormatter: (p) => (p.value === 1 ? "Influencer" : "Padrão"),
        cellRenderer: (p: ICellRendererParams) => {
            const isInfluencer = p.value === 1;

            const onToggle = async () => {
                const { id, rtp } = p.data as PlayerProps;
                const nextVal = isInfluencer ? 0 : 1;
                const t = toast.loading("Atualizando tipo...");
                try {
                    await updatePlayer({ id, influencer: nextVal, rtp });
                    toast.success(
                        nextVal === 1
                            ? "Jogador marcado como Influencer"
                            : "Jogador marcado como Padrão",
                        { id: t }
                    );
                    p.node.setDataValue("is_influencer", nextVal);
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : (error as { message?: string })?.message ||
                              "Erro ao atualizar tipo";
                    toast.error(message, {
                        id: t,
                    });
                }
            };

            return (
                <div className="flex items-center justify-center h-full w-full">
                    <Button
                        size="sm"
                        variant={isInfluencer ? "default" : "outline"}
                        onClick={onToggle}
                        className={twMerge(
                            "max-w-40 py-1 w-full text-center px-3",
                            isInfluencer ? "" : "text-foreground/70"
                        )}
                        aria-label="Alternar tipo do jogador"
                    >
                        {isInfluencer && (
                            <div className="size-fit">
                                <StarIcon size={12} />
                            </div>
                        )}
                        {isInfluencer ? "Influencer" : "Padrão"}
                    </Button>
                </div>
            );
        },
    },
    {
        headerName: "Apostas",
        field: "valor_debitado",
        flex: 1,
        minWidth: 120,
    },
    {
        headerName: "Ganhos",
        field: "valor_ganho",
        flex: 1,
        minWidth: 120,
        cellStyle: (p) => {
            const value = parseFloat(
                p.value?.replace("R$", "").replace(",", ".") || "0"
            );
            return {
                color: value > 0 ? "#95BD2B" : value < 0 ? "#E53935" : "#ccc",
            };
        },
    },
    {
        headerName: "Saldo",
        field: "saldo",
        flex: 1,
        minWidth: 120,
    },
    {
        headerName: "RPT",
        field: "rtp",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams) => {
            const { id, is_influencer } = p.data as PlayerProps;
            const current = String(p.value ?? "");

            const onBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
                const raw = e.target.value.trim().replace("%", "");
                if (raw === current) return;

                if (raw === "") {
                    toast.error("RTP não pode ser vazio");
                    e.target.value = current;
                    return;
                }

                const numeric = Number(raw);
                if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
                    toast.error("RTP deve estar entre 0 e 100");
                    e.target.value = current;
                    return;
                }

                const t = toast.loading("Atualizando RTP...");
                try {
                    await updatePlayer({
                        id,
                        rtp: String(numeric),
                        influencer: is_influencer,
                    });
                    toast.success("RTP atualizado", { id: t });
                    p.node.setDataValue("rtp", String(numeric));
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : (error as { message?: string })?.message ||
                              "Erro ao atualizar RTP";
                    toast.error(message, {
                        id: t,
                    });
                    e.target.value = current;
                }
            };

            return (
                <div className="flex items-center justify-center h-full w-full">
                    <input
                        defaultValue={current}
                        onBlur={onBlur}
                        inputMode="numeric"
                        className="w-full max-w-24 text-center bg-transparent border border-foreground/20 rounded py-1 text-sm text-foreground/80 focus:outline-none focus:border-primary"
                        aria-label="RTP do jogador"
                    />
                    <span className="ml-1 text-foreground/50 text-sm">%</span>
                </div>
            );
        },
    },
    {
        headerName: "Agente",
        field: "agentCode",
        flex: 1,
        minWidth: 120,
    },
];

const PlayersTable = ({ players }: { players: PlayerProps[] }) => {
    const [filter, setFilter] = useState("");
    const gridRef = useRef<AgGridReact<PlayerProps>>(null);

    return (
        <div className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between bg-background-primary items-start sm:items-center p-4 rounded-t-md border-b border-b-foreground/20 gap-4">
                <h2 className="font-semibold">Seus Jogadores</h2>
                <div className="relative w-full sm:w-auto">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilter(value);
                            gridRef.current?.api.setGridOption(
                                "quickFilterText",
                                value
                            );
                        }}
                        placeholder="Pesquisa"
                        className="border py-1 rounded border-foreground/20 pl-8 w-full sm:w-auto"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<PlayerProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={players}
                        getRowId={(params) =>
                            String((params.data as PlayerProps).id)
                        }
                        domLayout="autoHeight"
                        defaultColDef={{
                            flex: 1,
                            cellClass: "bg-background-primary text-foreground",
                            minWidth: 100,
                            resizable: true,
                            headerClass:
                                "bg-background-secondary text-foreground/50 font-semibold",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayersTable;
