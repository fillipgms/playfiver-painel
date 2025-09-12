"use client";
import Agent from "@/components/Agent";
import CreateAgent from "@/components/CreateAgent";
import { useRef, useEffect, useState } from "react";

import { getAgentsData } from "@/actions/agents";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function AgentesPage() {
    const agentRef = useRef<HTMLDivElement>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [paginatedAgents, setPaginatedAgents] =
        useState<AgentsResponse | null>(null);
    const [agentHeight, setAgentHeight] = useState<number | undefined>(
        undefined
    );
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const loadAgents = async (current = page, query = search) => {
        const res = await getAgentsData({ page: current, search: query });
        setPaginatedAgents(res);
        setAgents(res.data);
    };

    useEffect(() => {
        loadAgents(1, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (agentRef.current) {
            setAgentHeight(agentRef.current.offsetHeight);
        }
    }, [agents]);

    return (
        <>
            <div className="flex items-center justify-between px-2 sm:px-4 lg:px-0 mb-4">
                <div className="relative w-full">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Pesquisar agentes..."
                        className="border bg-background-primary rounded pl-8 pr-3 py-2 w-full "
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setPage(1);
                                loadAgents(1, search);
                            }
                        }}
                    />
                </div>
            </div>

            <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0">
                <CreateAgent
                    height={agentHeight ?? 0}
                    onAgentCreated={loadAgents}
                />
                {agents.map((agente, i) => (
                    <Agent
                        key={agente.id}
                        ref={i === 0 ? agentRef : undefined}
                        agent={agente}
                        onActionHappen={loadAgents}
                    />
                ))}
            </main>

            {paginatedAgents && paginatedAgents.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => {
                            const next = Math.max(1, page - 1);
                            setPage(next);
                            loadAgents(next, search);
                        }}
                        disabled={page <= 1}
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-foreground/70">
                        Página {paginatedAgents.current_page} de{" "}
                        {paginatedAgents.last_page}
                    </span>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => {
                            const next = Math.min(
                                paginatedAgents.last_page,
                                page + 1
                            );
                            setPage(next);
                            loadAgents(next, search);
                        }}
                        disabled={page >= paginatedAgents.last_page}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </>
    );
}
