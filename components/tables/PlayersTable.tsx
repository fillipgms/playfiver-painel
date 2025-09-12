"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState } from "react";
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

            return (
                <div className="flex items-center justify-center h-full w-full">
                    <div
                        className={twMerge(
                            "flex items-center gap-1 justify-center max-w-40 py-1 w-full text-center px-3 rounded text-sm font-medium",
                            isInfluencer
                                ? "bg-primary/20 text-primary"
                                : "bg-foreground/20 text-foreground/50"
                        )}
                    >
                        {isInfluencer && (
                            <div className="size-fit">
                                <StarIcon size={12} />
                            </div>
                        )}
                        <p className="truncate">
                            {isInfluencer ? "Influencer" : "Padrão"}
                        </p>
                    </div>
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
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => {
            const value = `${p.value}%`;
            return <div className="text-foreground/50">{value}</div>;
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
