"use client";
import {
    UserIcon,
    GlobeIcon,
    CurrencyDollarIcon,
    PercentIcon,
    LockIcon,
    GameControllerIcon,
    ShieldIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMediaQuery } from "usehooks-ts";
import React, { useState } from "react";
import Button from "./Button";
import {
    Select,
    SelectValue,
    SelectItem,
    SelectContent,
    SelectTrigger,
} from "./ui/select";
import { Dialog, DialogContent } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";

const options = [
    { label: "Real Brasileiro (BRL)", value: "BRL" },
    { label: "Dolar(USD)", value: "USD" },
    { label: "Euro (EUR)", value: "EUR" },
    { label: "Guarani (PYG)", value: "PYG" },
    { label: "Iene japonês (JPY)", value: "JPY" },
    { label: "Rublo russo (RUR)", value: "RUR" },
    { label: "Taka bengali (BDT)", value: "BDT" },
    { label: "Yuan (RMB)", value: "RMB" },
    { label: "Baht (THB)", value: "THB" },
    { label: "Rupia (INR)", value: "INR" },
    { label: "Peso Filipino (PHP)", value: "PHP" },
    { label: "Birr etíope (ETB)", value: "ETB" },
];

interface EditAgentProps {
    agent: Agent;
    onClose: () => void;
    onSuccess?: () => void;
}

const EditAgentForm = ({ agent, onClose, onSuccess }: EditAgentProps) => {
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        agent_code: agent.agent_code,
        agent_memo: agent.agent_memo,
        url: agent.url,
        currency: agent.currency,
        rtp: agent.rtp,
        rtp_user: agent.rtp_user,
        bonus_enable: Boolean(agent.bonus_enable),
        limit_enable: Boolean(agent.limit_enable),
        limit_amount: agent.limite_amount,
        limit_hours: agent.limit_hours,
        agent_password: agent.password,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target;
        const value =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : e.target.value;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.agent_code?.trim() || !form.agent_memo?.trim()) {
            setError("Preencha Id único e Memo (Nome)");
            return;
        }

        if (!form.currency) {
            setError("Por favor, selecione uma moeda");
            return;
        }

        const rtpNum = Number(form.rtp);
        if (!Number.isFinite(rtpNum) || rtpNum < 1 || rtpNum > 100) {
            setError("RTP deve ser um número entre 1 e 100");
            return;
        }

        setError("");

        try {
            setSubmitting(true);

            const { updateAgent } = await import("@/actions/agents");
            await updateAgent(agent.id, {
                agent_memo: form.agent_memo,
                agent_code: form.agent_code,
                password: form.agent_password || "",
                rtp: form.rtp,
                rtp_user: form.rtp_user,
                url: form.url,
                currency: form.currency,
                bonus_enable: form.bonus_enable,
                limit_enable: form.limit_enable,
                limit_amount: form.limit_amount,
                limit_hours: form.limit_hours,
            });

            onSuccess?.();
            onClose();
        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : "Erro ao salvar";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePercentTextChange = (
        value: string,
        field: "rtp" | "rtp_user"
    ) => {
        let sanitized = value.replace(/[^0-9.]/g, "");
        const parts = sanitized.split(".");
        if (parts.length > 2) {
            sanitized = parts.shift()! + "." + parts.join("");
        }
        const numeric = Number(sanitized);
        if (Number.isFinite(numeric)) {
            const clamped = Math.max(1, Math.min(100, numeric));
            setForm((prev) => ({ ...prev, [field]: String(clamped) }));
        } else {
            setForm((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const rtpNumber = Number(form.rtp) || 0;
    const rtpUserNumber = Number(form.rtp_user) || 0;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Editar Agente
                </h2>
                <p className="text-sm text-foreground/60">
                    Atualize as configurações do agente
                </p>
            </div>

            <form
                className="space-y-6"
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!submitting) {
                        void handleSubmit();
                    }
                }}
            >
                <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                />
                <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                />

                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-foreground/10">
                        <UserIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">
                            Informações Básicas
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-foreground"
                                htmlFor="agent_code"
                            >
                                ID Único *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="agent_code"
                                    name="agent_code"
                                    className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="off"
                                    value={form.agent_code}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Ex: agent_001"
                                />
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-foreground"
                                htmlFor="agent_memo"
                            >
                                Nome do Agente *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="agent_memo"
                                    name="agent_memo"
                                    className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoComplete="off"
                                    value={form.agent_memo}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Ex: Agente Principal"
                                />
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-sm font-medium text-foreground"
                            htmlFor="url"
                        >
                            Callback URL
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                id="url"
                                name="url"
                                className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                autoComplete="off"
                                inputMode="url"
                                value={form.url}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder="https://exemplo.com/callback"
                            />
                            <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-foreground/10">
                        <GameControllerIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">
                            Configurações do Jogo
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Moeda *
                            </label>
                            <Select
                                value={form.currency || undefined}
                                onValueChange={(value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        currency: value,
                                    }));
                                }}
                                disabled={submitting}
                            >
                                <SelectTrigger className="w-full h-10 border-foreground/20 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <div className="flex items-center gap-2">
                                        <CurrencyDollarIcon className="w-4 h-4 text-foreground/40" />
                                        <SelectValue placeholder="Selecione uma moeda" />
                                    </div>
                                </SelectTrigger>

                                <SelectContent position="item-aligned">
                                    {options.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-foreground"
                                htmlFor="rtp"
                            >
                                RTP Sistema *
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="rtp"
                                        name="rtp"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        className="w-full h-10 px-3 pr-8 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={form.rtp}
                                        onChange={(e) =>
                                            handlePercentTextChange(
                                                e.target.value,
                                                "rtp"
                                            )
                                        }
                                        disabled={submitting}
                                        placeholder="95.5"
                                    />
                                    <PercentIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                </div>

                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        step={0.01}
                                        value={rtpNumber}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                rtp: String(
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value
                                                ),
                                            }))
                                        }
                                        disabled={submitting}
                                        className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-foreground/60">
                                        <span>1%</span>
                                        <span className="font-medium text-primary">
                                            {rtpNumber
                                                ? rtpNumber.toFixed(2)
                                                : "0.00"}
                                            %
                                        </span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-foreground"
                                htmlFor="rtp_user"
                            >
                                RTP Usuários *
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="rtp_user"
                                        name="rtp_user"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        className="w-full h-10 px-3 pr-8 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={form.rtp_user}
                                        onChange={(e) =>
                                            handlePercentTextChange(
                                                e.target.value,
                                                "rtp_user"
                                            )
                                        }
                                        disabled={submitting}
                                        placeholder="95.5"
                                    />
                                    <PercentIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                </div>

                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        step={0.01}
                                        value={rtpUserNumber}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                rtp_user: String(
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value
                                                ),
                                            }))
                                        }
                                        disabled={submitting}
                                        className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-foreground/60">
                                        <span>1%</span>
                                        <span className="font-medium text-primary">
                                            {rtpUserNumber
                                                ? rtpUserNumber.toFixed(2)
                                                : "0.00"}
                                            %
                                        </span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background-secondary/50 rounded-lg border border-foreground/10">
                            <div className="flex items-center gap-3">
                                <GameControllerIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <span className="text-sm font-medium text-foreground">
                                        Jogos com Bônus
                                    </span>
                                    <p className="text-xs text-foreground/60">
                                        Habilitar jogos que oferecem bônus
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="bonus_enable"
                                    className="sr-only peer"
                                    checked={form.bonus_enable}
                                    onChange={handleChange}
                                    disabled={submitting}
                                />
                                <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-foreground/10">
                        <ShieldIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">
                            Limites de Aposta
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background-secondary/50 rounded-lg border border-foreground/10">
                            <div className="flex items-center gap-3">
                                <ShieldIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <span className="text-sm font-medium text-foreground">
                                        Limite de Aposta
                                    </span>
                                    <p className="text-xs text-foreground/60">
                                        Definir limites para apostas do agente
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="limit_enable"
                                    className="sr-only peer"
                                    checked={form.limit_enable}
                                    onChange={handleChange}
                                    disabled={submitting}
                                />
                                <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {form.limit_enable && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background-secondary/30 rounded-lg border border-foreground/10">
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-foreground"
                                        htmlFor="limit_amount"
                                    >
                                        Quantia do Limite
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            id="limit_amount"
                                            name="limit_amount"
                                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            autoComplete="off"
                                            inputMode="decimal"
                                            value={form.limit_amount}
                                            onChange={handleChange}
                                            disabled={submitting}
                                            placeholder="0.00"
                                        />
                                        <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-foreground"
                                        htmlFor="limit_hours"
                                    >
                                        Horas do Limite
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            id="limit_hours"
                                            name="limit_hours"
                                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            autoComplete="off"
                                            inputMode="numeric"
                                            value={form.limit_hours}
                                            onChange={handleChange}
                                            disabled={submitting}
                                            placeholder="24"
                                        />
                                        <ShieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-foreground/10">
                        <LockIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">
                            Segurança
                        </h3>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-sm font-medium text-foreground"
                            htmlFor="agent_password"
                        >
                            Senha do Agente
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="agent_password"
                                name="agent_password"
                                className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                autoComplete="new-password"
                                value={form.agent_password}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder="Digite uma senha segura"
                            />
                            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Salvando...
                            </div>
                        ) : (
                            "Salvar Alterações"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const EditAgent = ({ agent, onClose, onSuccess }: EditAgentProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <>
            <Dialog open={Boolean(isDesktop)} onOpenChange={onClose}>
                <DialogContent className="bg-background-primary max-h-[85vh] overflow-y-auto max-w-2xl">
                    <DialogTitle className="sr-only">Editar agente</DialogTitle>
                    <EditAgentForm
                        agent={agent}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                </DialogContent>
            </Dialog>

            <Drawer open={Boolean(!isDesktop)} onOpenChange={onClose}>
                <DrawerContent className="bg-background-primary max-w-[calc(100vw_-_2rem)] after:hidden mx-auto p-5 max-h-[90vh] overflow-y-auto">
                    <DrawerTitle className="sr-only">Editar agente</DrawerTitle>
                    <ScrollArea className="p-4 max-h-[60vh] overflow-auto">
                        <EditAgentForm
                            agent={agent}
                            onClose={onClose}
                            onSuccess={onSuccess}
                        />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default EditAgent;
