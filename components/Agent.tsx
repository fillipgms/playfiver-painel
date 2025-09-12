import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./Card";
import {
    DotsThreeVerticalIcon,
    LinkSimpleIcon,
    RobotIcon,
    TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Icon from "./Icon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PencilIcon } from "@phosphor-icons/react";
import { deleteAgent } from "@/actions/agents";
import EditAgent from "./EditAgent";

const Agent = React.forwardRef<
    HTMLDivElement,
    { agent: Agent; onActionHappen: () => void }
>(({ agent, onActionHappen }, ref) => {
    const [loading, setLoading] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o agente "${agent.agent_memo}"?`
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            await deleteAgent(agent.id);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
            alert("Erro ao excluir o agente. Tente novamente.");
        }

        onActionHappen();
    };

    const handleEdit = () => {
        setShowEdit(true);
    };

    const handleEditClose = () => {
        setShowEdit(false);
    };

    const handleEditSuccess = () => {
        onActionHappen();
    };

    return (
        <Card ref={ref}>
            <CardHeader>
                <div className="flex items-center w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Icon>
                            <RobotIcon />
                        </Icon>
                        <h2 className="font-bold text-lg">
                            {agent.agent_memo}
                        </h2>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer p-2 bg-background-secondary rounded border border-foregorund/20">
                            <DotsThreeVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="bg-background-secondary"
                            align="end"
                        >
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleEdit}
                            >
                                <PencilIcon className="text-[#ffa600]" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="cursor-pointer"
                            >
                                <TrashIcon className="text-[#E53935]" />
                                {loading ? "Excluindo..." : "Excluir"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <section className="flex items-center w-full justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-3xl text-primary font-bold border-r-2 border-primary pr-2">
                            RPT
                        </p>
                        <div className="flex flex-col">
                            <p className=" text-sm text-foreground/50">
                                Sistema: {agent.rtp}%
                            </p>
                            <p>Usuário: {agent.rtp_user}%</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className=" text-sm text-foreground/50">Moeda</p>
                        <p>{agent.currency}</p>
                    </div>
                </section>
                <section className="flex flex-col">
                    <p className=" text-sm text-foreground/50">Callback URL</p>
                    <Link
                        href={agent.url}
                        target="_blank"
                        className="underline text-primary flex gap-1 items-center "
                    >
                        <span>
                            <LinkSimpleIcon />
                        </span>
                        <span className="truncate">{agent.url}</span>
                    </Link>
                </section>
                <section className="flex justify-between items-center text-foreground/50 text-sm">
                    <div>
                        Criado em:{" "}
                        {new Date(agent.created_date).toLocaleDateString(
                            "pt-BR"
                        )}
                    </div>
                    <div>
                        {agent.influencers > 0 ? agent.influencers : 0}{" "}
                        influencers
                    </div>
                </section>
            </CardContent>

            {showEdit && (
                <EditAgent
                    agent={agent}
                    onClose={handleEditClose}
                    onSuccess={handleEditSuccess}
                />
            )}
        </Card>
    );
});

Agent.displayName = "Agent";

export default Agent;
