import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { forwardRef, useImperativeHandle } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IFilterParams } from "ag-grid-community";

interface PlayerAgentFilterProps extends IFilterParams {
    agentes: {
        id: number;
        agentCode: string;
    }[];
}

const PlayerAgentFilter = forwardRef((props: PlayerAgentFilterProps, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { agentes } = props;

    const currentAgentsString = searchParams.get("agent") || "";
    const currentAgents = currentAgentsString
        ? currentAgentsString
              .replace(/[\[\]]/g, "")
              .split(",")
              .filter(Boolean)
        : [];

    useImperativeHandle(ref, () => {
        return {
            isFilterActive: () => currentAgents.length > 0,
            doesFilterPass: () => true,
            getModel: () => currentAgents,
            setModel: () => {},
        };
    });

    const handleSelect = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("page", "1");

        console.log(currentAgents);

        let newAgents: string[];
        if (currentAgents.includes(value)) {
            newAgents = currentAgents.filter((a) => a !== value);
        } else {
            newAgents = [...currentAgents, value];
        }

        if (newAgents.length > 0) {
            params.set("agent", `[${newAgents.join(",")}]`);
        } else {
            params.delete("agent");
        }

        router.push(`/jogadores?${params.toString()}`);
    };

    return (
        <div className="w-[200px] bg-background border-none shadow-none">
            <Command className="h-full w-full border-0 outline-none">
                <CommandInput placeholder="Buscar agente..." className="h-9" />
                <CommandList>
                    <CommandEmpty>Nenhum agente encontrado.</CommandEmpty>
                    <CommandGroup>
                        {agentes?.map((agent) => {
                            const isSelected = currentAgents.includes(
                                agent.id.toString(),
                            );

                            return (
                                <CommandItem
                                    key={agent.id}
                                    value={agent.id.toString()}
                                    onSelect={() =>
                                        handleSelect(agent.id.toString())
                                    }
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible",
                                        )}
                                    >
                                        <CheckIcon className="h-3 w-3 text-background" />
                                    </div>
                                    <span>{agent.agentCode}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
});

PlayerAgentFilter.displayName = "PlayerAgentFilter";

export default PlayerAgentFilter;
