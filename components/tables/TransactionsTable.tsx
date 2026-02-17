"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import {
    CheckIcon,
    MagnifyingGlassIcon,
    StarIcon,
    XIcon,
    FunnelSimpleIcon,
    CalendarBlankIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
} from "../ui/select";
import { getAgentsData } from "@/actions/agents";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
ModuleRegistry.registerModules([AllCommunityModule]);

interface TransactionProps {
    id: number;
    game: string;
    game_original: number;
    provedor: string;
    user: string;
    agente: string;
    id_transaction: string;
    bet_amount: string;
    win_amount: string;
    tipo: string;
    status: number;
    balance_wallet_before: string;
    balance_wallet_after: string;
    balance_player_before: string;
    balance_player_after: string;
    walletName: string;
    influencer: number;
    reembolsada: number;
    rtpUser: string;
    rtpAgent: string;
    status_code: number;
    obs: string | null;
    created_at: string;
}

const cols: ColDef<TransactionProps>[] = [
    {
        headerName: "Jogador",
        field: "user",
        flex: 1,
        minWidth: 150,
        pinned: "left",

        cellRenderer: (p: ICellRendererParams) => {
            const { id_transaction, user } = p.data;

            return (
                <div className="flex flex-col h-full w-full justify-center">
                    <div className="flex gap-1 items-center">
                        <p className="leading-none">{user}</p>
                    </div>
                    <p className="text-xs text-foreground/50 truncate">
                        {id_transaction}
                    </p>
                </div>
            );
        },
    },
    {
        headerName: "Tipo",
        field: "influencer",
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
                                : "bg-foreground/20 text-foreground/50",
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
        headerName: "Jogo",
        field: "game",
        flex: 1,
        minWidth: 120,
        cellStyle: () => {
            return {
                fontWeight: "medium",
            };
        },
    },
    {
        headerName: "Aposta",
        field: "bet_amount",
        flex: 1,
        minWidth: 120,
    },
    {
        headerName: "Resultado",
        field: "win_amount",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams) => {
            const { tipo, bet_amount, win_amount } = p.data;
            const value = tipo === "Perca" ? bet_amount : win_amount;

            return (
                <p
                    className={
                        tipo === "Perca" ? "text-[#E53935]" : "text-[#95BD2B]"
                    }
                >
                    {tipo === "Perca" ? "-" : "+"} {value}
                </p>
            );
        },
    },
    {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams) => {
            const isSuccess = p.value === 1;

            const { obs } = p.data;

            return (
                <div className="flex items-center justify-center h-full w-full">
                    {isSuccess ? (
                        <div
                            className={twMerge(
                                "flex items-center gap-1 justify-center max-w-40 py-1 w-full text-center px-3 rounded text-sm font-medium bg-[#95BD2B]/20 text-[#95BD2B]",
                            )}
                        >
                            <div className="size-fit">
                                <CheckIcon size={12} />
                            </div>

                            <p className="truncate">Sucesso</p>
                        </div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 justify-center max-w-40 py-1 w-full text-center px-3 rounded text-sm font-medium bg-[#E53935]/20 text-[#E53935]">
                                <div className="size-fit">
                                    <XIcon size={12} />
                                </div>
                                <p className="truncate">Erro</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{obs}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            );
        },
    },
    {
        headerName: "RPT",
        field: "rtpUser",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => {
            const value = `${p.value}%`;
            return <div className="text-foreground/50">{value}</div>;
        },
    },
    {
        headerName: "Agente",
        field: "agente",
        flex: 1,
        minWidth: 100,
    },
    {
        headerName: "Data e Hora",
        field: "created_at",
        flex: 1,
        minWidth: 150,
        cellRenderer: (p: ICellRendererParams) => {
            if (!p.value) return null;
            const date = new Date(p.value);
            const formatted = `${date.toLocaleDateString(
                "pt-BR",
            )} às ${date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`;
            return <div className="text-foreground/50">{formatted}</div>;
        },
    },
];

const TransactionsTable = ({
    transactions,
}: {
    transactions: TransactionProps[];
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [agentes, setAgentes] = useState<Agent[]>();

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await getAgentsData({ page: 1, search: "" });
                if (!active) return;
                setAgentes(res.data);
            } catch {
                // fail silently in UI; could add toast later
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        setSearchText(filters.search || "");
    }, [filters.search]);

    const gridRef = useRef<AgGridReact<TransactionProps>>(null);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const createQueryString = useCallback((f: TransactionFilters) => {
        const params = new URLSearchParams();

        if (f.search) params.set("search", f.search);
        if (f.page && f.page > 1) params.set("page", f.page.toString());
        if (f.dateStart) params.set("dateStart", f.dateStart.toString());
        if (f.dateEnd) params.set("dateEnd", f.dateEnd.toString());
        if (f.agent) params.set("agent", f.agent.toString());

        return params.toString();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        const parsedFilters: TransactionFilters = {
            page: params.get("page") ? Number(params.get("page")) : 1,
            search: params.get("search") || undefined,
            dateStart: params.get("dateStart") || undefined,
            dateEnd: params.get("dateEnd") || undefined,
            agent: params.get("agent") || undefined,
        };

        setFilters((prev) => {
            const prevQS = createQueryString(prev);
            const nextQS = createQueryString(parsedFilters);
            return prevQS === nextQS ? prev : parsedFilters;
        });
    }, [searchParams, createQueryString]);

    const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };

        (
            ["search", "dateStart", "dateEnd", "agent"] as Array<
                keyof TransactionFilters
            >
        ).forEach((key) => {
            if (updatedFilters[key] === "") {
                updatedFilters[key] = undefined;
            }
        });

        const nextFilters: TransactionFilters = { ...updatedFilters, page: 1 };

        const prevQS = createQueryString(filters);
        const nextQS = createQueryString(nextFilters);

        if (prevQS === nextQS) return;

        setFilters(nextFilters);
        router.push(nextQS ? pathname + "?" + nextQS : pathname);
    };

    const handleSearch = (search: string) => {
        setSearchText(search);
        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleFilterChange({ search: search || undefined });
            setIsSearching(false);
        }, 500);
    };

    const clearSearch = () => {
        setSearchText("");
        handleFilterChange({ search: undefined });
    };

    const formatDateTime = (d?: Date) => {
        if (!d) return undefined;
        const datePart = d.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });

        const timePart = d.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        return `${datePart} ${timePart}`;
    };

    const parseDate = (value?: string) => {
        if (!value) return undefined;
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
    };

    const handleDateRangeChange = (dates: DateRange | undefined) => {
        if (!dates) {
            handleFilterChange({ dateStart: undefined, dateEnd: undefined });
            return;
        }

        handleFilterChange({
            dateStart: formatDateTime(dates.from),
            dateEnd: formatDateTime(dates.to),
        });
    };

    const clearAllFilters = () => {
        handleFilterChange({
            search: undefined,
            dateStart: undefined,
            dateEnd: undefined,
            agent: undefined,
        });
    };

    const hasActiveFilters = () => {
        return !!(
            filters.search ||
            filters.dateStart ||
            filters.dateEnd ||
            filters.agent
        );
    };

    return (
        <div className="w-full space-y-6 overflow-hidden">
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Pesquisar transações..."
                                className="w-full pl-10 pr-10 py-3 rounded-lg border border-input bg-background-primary text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Pesquisar transações"
                            />
                            {!isSearching && searchText && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                    aria-label="Limpar pesquisa"
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            )}
                            {isSearching && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <FunnelSimpleIcon className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters() && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>

                        {hasActiveFilters() && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    clearAllFilters();
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <Card className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">
                                Agente
                            </label>
                            <Select
                                value={filters.agent || ""}
                                onValueChange={(value) =>
                                    handleFilterChange({
                                        agent: value || undefined,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um Agente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="sr-only">
                                            Agentes
                                        </SelectLabel>
                                        {agentes?.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={a.agent_code}
                                            >
                                                {a.agent_memo || a.agent_code}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium px-1">
                                Período
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        data-empty={
                                            !parseDate(filters.dateStart)
                                        }
                                    >
                                        <CalendarBlankIcon className="mr-2 h-4 w-4" />
                                        {parseDate(filters.dateStart) ? (
                                            parseDate(filters.dateEnd) ? (
                                                <>
                                                    {format(
                                                        parseDate(
                                                            filters.dateStart,
                                                        ) as Date,
                                                        "dd/MM/yyyy",
                                                    )}{" "}
                                                    -{" "}
                                                    {format(
                                                        parseDate(
                                                            filters.dateEnd,
                                                        ) as Date,
                                                        "dd/MM/yyyy",
                                                    )}
                                                </>
                                            ) : (
                                                format(
                                                    parseDate(
                                                        filters.dateStart,
                                                    ) as Date,
                                                    "PPP",
                                                )
                                            )
                                        ) : (
                                            <span>Selecione o período</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="range"
                                        selected={{
                                            from: parseDate(filters.dateStart),
                                            to: parseDate(filters.dateEnd),
                                        }}
                                        onSelect={handleDateRangeChange}
                                        captionLayout="dropdown"
                                        numberOfMonths={2}
                                        defaultMonth={
                                            parseDate(filters.dateStart) ||
                                            new Date()
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Card>
                )}
            </div>

            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<TransactionProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={transactions}
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

export default TransactionsTable;
