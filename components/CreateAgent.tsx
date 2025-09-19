"use client";
import {
    PlusIcon,
    UserIcon,
    GlobeIcon,
    CurrencyDollarIcon,
    PercentIcon,
    LockIcon,
    GameControllerIcon,
} from "@phosphor-icons/react";
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

const Form = ({
    onClose,
    onAgentCreated,
}: {
    onClose: () => void;
    onAgentCreated?: () => void;
}) => {
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        agent_code: "",
        agent_memo: "",
        url: "",
        currency: undefined as string | undefined,
        rtp: "",
        bonus_enable: false,
        agent_password: "",
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

            const { createAgent } = await import("@/actions/agents");
            const result = await createAgent({
                agent_memo: form.agent_memo,
                agent_code: form.agent_code,
                password: form.agent_password || "",
                rtp: form.rtp,
                url: form.url,
                currency: form.currency,
                bonus_enable: form.bonus_enable,
            });

            if (result?.success) {
                onClose();
                onAgentCreated?.();
            } else {
                setError(result?.error || "Erro ao salvar");
            }
        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : "Erro ao salvar";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRtpTextChange = (value: string) => {
        let sanitized = value.replace(/[^0-9.]/g, "");
        const parts = sanitized.split(".");
        if (parts.length > 2) {
            sanitized = parts.shift()! + "." + parts.join("");
        }
        const numeric = Number(sanitized);
        if (Number.isFinite(numeric)) {
            const clamped = Math.max(1, Math.min(100, numeric));
            setForm((prev) => ({ ...prev, rtp: String(clamped) }));
        } else {
            setForm((prev) => ({ ...prev, rtp: "" }));
        }
    };

    const rtpNumber = Number(form.rtp) || 0;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Criar Novo Agente
                </h2>
                <p className="text-sm text-foreground/60">
                    Configure as informações do agente para começar
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
                                RTP (Return to Player) *
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
                                            handleRtpTextChange(e.target.value)
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
                                        className="w-full h-2 bg-foreground/20 dark:bg-foreground/10 rounded-lg appearance-none cursor-pointer slider"
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

                    <div className="flex items-center justify-between p-4 bg-background-secondary/50 rounded-lg border border-foreground/10">
                        <div className="flex items-center gap-3">
                            <GameControllerIcon className="w-5 h-5 text-primary" />
                            <div>
                                <span className="text-sm font-medium text-foreground">
                                    Jogos com Bônus
                                </span>
                                <p className="text-xs text-foreground/60">
                                    Habilitar bônus nos jogos que oferecem bônus
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
                            "Criar Agente"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const CreateAgent = ({
    height,
    onAgentCreated,
}: {
    height: number;
    onAgentCreated?: () => void;
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                id="criar-agente"
                style={{ height }}
                className="group border-2 border-dashed min-h-[12rem] h-full border-primary/30 hover:border-primary/60 text-foreground/60 hover:text-primary cursor-pointer flex flex-col items-center justify-center rounded-lg text-lg transition-all duration-200 hover:bg-primary/5"
                onClick={handleOpen}
            >
                <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-3 transition-colors duration-200">
                    <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Criar Novo Agente</span>
                <span className="text-xs text-foreground/40 mt-1">
                    Clique para adicionar
                </span>
            </button>

            <Dialog open={Boolean(isDesktop && open)} onOpenChange={setOpen}>
                <DialogContent className="bg-background-primary max-h-[85vh] overflow-y-auto max-w-2xl">
                    <DialogTitle className="sr-only">Criar agente</DialogTitle>
                    <Form
                        onClose={handleClose}
                        onAgentCreated={onAgentCreated}
                    />
                </DialogContent>
            </Dialog>

            <Drawer open={Boolean(!isDesktop && open)} onOpenChange={setOpen}>
                <DrawerContent className="bg-background-primary max-w-[calc(100vw_-_2rem)] mx-auto p-5 after:hidden">
                    <DrawerTitle className="sr-only">Criar Agente</DrawerTitle>
                    <ScrollArea className="p-4 max-h-[60vh] overflow-auto">
                        <Form
                            onClose={handleClose}
                            onAgentCreated={onAgentCreated}
                        />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CreateAgent;
