"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "./ui/dialog";
import Button from "./Button";
import {
    createInfluencerOrder,
    getInfluencerOrderStatus,
} from "@/actions/signature";
import { twMerge } from "tailwind-merge";
import { IMaskInput } from "react-imask";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

type PaymentType = "pix" | "crypto";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BuyInfluencerDialogProps {
    signatureData: SignatureResponse;
    cpf?: string;
    triggerClassName?: string;
}

const BuyInfluencerDialog: React.FC<BuyInfluencerDialogProps> = ({
    signatureData,
    cpf = "",
    triggerClassName,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentType, setPaymentType] = useState<PaymentType>("pix");
    const [cpfValue, setCpfValue] = useState<string>("");
    const [selectedAgent, setSelectedAgent] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const [orderResponse, setOrderResponse] =
        useState<InfluencerOrderResponse | null>(null);
    const [orderId, setOrderId] = useState<string>("");
    const [status, setStatus] = useState<Record<string, unknown> | null>(null);
    const [notifiedPaid, setNotifiedPaid] = useState(false);
    const [copied, setCopied] = useState(false);

    const influencerPrice = parseFloat(signatureData.prices.inf);
    const totalPrice = influencerPrice * quantity;

    const formatCurrencyBRL = (value: number): string =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);

    const submit = async () => {
        if (selectedAgent === 0) {
            alert("Selecione um agente");
            return;
        }

        setSubmitting(true);
        setOrderResponse(null);
        setStatus(null);

        try {
            const payload = {
                cpf:
                    paymentType === "pix"
                        ? cpfValue.replace(/\D/g, "") || cpf
                        : cpf,
                typeMethod: paymentType,
                quantity: quantity,
                type: "inf" as const,
                idAgent: selectedAgent,
            };

            const data = await createInfluencerOrder(payload);
            setOrderResponse(data);
            if (data?.id) setOrderId(String(data.id));
        } catch (e) {
            console.error(e);
            alert("Erro ao criar pedido de influencer");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        const interval = setInterval(async () => {
            try {
                const data = await getInfluencerOrderStatus(orderId);
                setStatus(data);

                if (!notifiedPaid) {
                    toast.success("Pagamento confirmado!");
                    setNotifiedPaid(true);
                    router.refresh();
                    setOpen(false);
                    setOrderId("");
                }
            } catch (e) {
                console.error(e);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [orderId, notifiedPaid, router]);

    const handleCopyPix = async () => {
        if (!orderResponse?.qrcode) return;
        try {
            await navigator.clipboard.writeText(orderResponse.qrcode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={twMerge(triggerClassName)}>Comprar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-background-primary max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Comprar Influencers</DialogTitle>
                    <DialogDescription>
                        Selecione a quantidade de influencers e o agente para
                        compra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-foreground/70">
                            Quantidade de Influencers
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(
                                    Math.max(1, parseInt(e.target.value) || 1)
                                )
                            }
                            className="w-full rounded-md border border-foreground/20 px-3 py-2 outline-hidden focus:ring-2 focus:ring-foreground/30"
                        />
                        <p className="text-xs text-foreground/60">
                            Preço por influencer:{" "}
                            {formatCurrencyBRL(influencerPrice)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-foreground/70">
                            Agente
                        </label>
                        <Select
                            value={selectedAgent.toString()}
                            onValueChange={(value) =>
                                setSelectedAgent(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um agente" />
                            </SelectTrigger>
                            <SelectContent>
                                {signatureData.agentes.map((agent) => (
                                    <SelectItem
                                        key={agent.id}
                                        value={agent.id.toString()}
                                    >
                                        {agent.agent_memo} (ID: {agent.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1 p-3 rounded-md bg-foreground/5 border border-foreground/10">
                            <p className="text-foreground/60">Quantidade</p>
                            <p className="font-semibold">{quantity}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-md bg-foreground/5 border border-foreground/10">
                            <p className="text-foreground/60">Total</p>
                            <p className="font-semibold">
                                {formatCurrencyBRL(totalPrice)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Forma de pagamento
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                className={twMerge(
                                    "rounded-md border px-3 py-2 text-sm",
                                    paymentType === "pix"
                                        ? "border-[#95BD2B] bg-[#95BD2B]/10"
                                        : "border-foreground/10 bg-foreground/5"
                                )}
                                onClick={() => setPaymentType("pix")}
                            >
                                Pix
                            </button>
                            <button
                                className={twMerge(
                                    "rounded-md border px-3 py-2 text-sm",
                                    paymentType === "crypto"
                                        ? "border-[#95BD2B] bg-[#95BD2B]/10"
                                        : "border-foreground/10 bg-foreground/5"
                                )}
                                onClick={() => setPaymentType("crypto")}
                            >
                                Crypto
                            </button>
                        </div>
                    </div>

                    {paymentType === "pix" && (
                        <div className="space-y-2">
                            <label className="text-sm text-foreground/70">
                                CPF
                            </label>
                            <IMaskInput
                                mask="000.000.000-00"
                                placeholder="000.000.000-00"
                                value={cpfValue}
                                onAccept={(val: string) => setCpfValue(val)}
                                className="w-full rounded-md border border-foreground/20 px-3 py-2 outline-hidden focus:ring-2 focus:ring-foreground/30"
                            />
                            {cpfValue &&
                                cpfValue.replace(/\D/g, "").length !== 11 && (
                                    <p className="text-xs text-[#E53935]">
                                        Informe um CPF válido (11 dígitos)
                                    </p>
                                )}
                        </div>
                    )}

                    {orderResponse && (
                        <div className="space-y-2 border rounded-md p-3 border-foreground/10">
                            {paymentType === "pix" ? (
                                <>
                                    {orderResponse?.qrcode64 && (
                                        <div className="w-full max-w-[220px] mx-auto rounded overflow-hidden">
                                            <Image
                                                alt="QR Code Pix"
                                                src={`data:image/png;base64,${orderResponse.qrcode64}`}
                                                width={220}
                                                height={220}
                                                className="w-full h-auto"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    {orderResponse?.qrcode && (
                                        <div className="space-y-2">
                                            <p className="text-xs break-all bg-foreground/5 p-2 rounded">
                                                {orderResponse.qrcode}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCopyPix}
                                                    className="text-xs px-2 py-1 rounded border border-foreground/20 hover:bg-foreground/5"
                                                >
                                                    {copied
                                                        ? "Copiado"
                                                        : "Copiar código Pix"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                orderResponse?.payment_url && (
                                    <a
                                        className="text-sm underline text-primary"
                                        href={orderResponse.payment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Abrir link de pagamento
                                    </a>
                                )
                            )}
                        </div>
                    )}

                    {status && (
                        <div className="text-xs text-foreground/70">
                            Status:{" "}
                            <span className="font-medium">
                                {JSON.stringify(status)}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={submit}
                        disabled={
                            submitting ||
                            selectedAgent === 0 ||
                            (paymentType === "pix" &&
                                cpfValue.replace(/\D/g, "").length !== 11)
                        }
                        className={twMerge(
                            submitting ? "opacity-50 cursor-not-allowed" : ""
                        )}
                    >
                        {submitting ? "Processando..." : "Gerar pagamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BuyInfluencerDialog;
