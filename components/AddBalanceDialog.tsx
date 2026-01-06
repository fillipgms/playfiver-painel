"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { getWalletGGr } from "@/actions/carteiras";
import { createOrder, getOrderStatus } from "@/actions/orders";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const IMaskInput = dynamic(
    () => import("react-imask").then((m) => m.IMaskInput),
    {
        ssr: false,
        loading: () => null,
    }
);

type PaymentType = "pix" | "crypto";

const formatCurrencyBRL = (value: number): string =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^0-9.,-]/g, "");
    if (!cleaned) return 0;
    return (
        parseFloat(cleaned.replace(/\./g, "").replace(/,(?=\d{2}$)/, ".")) || 0
    );
};

interface AddBalanceDialogProps {
    walletId: number;
    walletType: number;
    cpf?: string;
    triggerClassName?: string;
    disabled?: boolean;
}

const AddBalanceDialog: React.FC<AddBalanceDialogProps> = ({
    walletId,
    walletType,
    cpf = "",
    triggerClassName,
    disabled = false,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [ggrTable, setGgrTable] = useState<GgrTableProps[]>([]);
    const [amount, setAmount] = useState<string>("");
    const [paymentType, setPaymentType] = useState<PaymentType>("pix");
    const [cpfValue, setCpfValue] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    type OrderResponse = {
        idTransaction?: string | number | null;
        qrcode?: string | null;
        qrcode64?: string | null;
        url?: string | null;
    } | null;
    const [orderResponse, setOrderResponse] = useState<OrderResponse>(null);
    const [orderId, setOrderId] = useState<string>("");
    const [status, setStatus] = useState<Record<string, unknown> | null>(null);
    const [notifiedPaid, setNotifiedPaid] = useState(false);

    useEffect(() => {
        if (!open) return;
        getWalletGGr(walletId)
            .then((data) => setGgrTable(Array.isArray(data) ? data : []))
            .catch(() => setGgrTable([]));
    }, [open, walletId]);

    const amountNumber = useMemo(() => {
        return typeof amount === "string" ? parseCurrency(amount) : 0;
    }, [amount]);

    const minTable = useMemo(() => {
        if (!ggrTable.length) return 0;
        return Math.min(...ggrTable.map((g) => parseFloat(g.above)));
    }, [ggrTable]);

    const currentGgr = useMemo(() => {
        const sorted = [...ggrTable].sort(
            (a, b) => parseFloat(b.above) - parseFloat(a.above)
        );
        for (const level of sorted) {
            if (amountNumber >= parseFloat(level.above)) return level.tax;
        }
        return sorted.length ? sorted[sorted.length - 1].tax : 0;
    }, [ggrTable, amountNumber]);

    const fichaValue = useMemo(() => {
        if (amountNumber <= 0) return 0;

        const sorted = [...ggrTable].sort(
            (a, b) => parseFloat(b.above) - parseFloat(a.above)
        );
        let ggrValue;
        for (const level of sorted) {
            if (amountNumber >= parseFloat(level.above)) {
                ggrValue = level.tax;
                break;
            }
        }

        if (ggrValue === undefined) {
            ggrValue = sorted.length ? sorted[sorted.length - 1].tax : 13;
        }

        const ggr_decimal = ggrValue / 100;
        const valor_ajustado = amountNumber / ggr_decimal;

        if (!isNaN(valor_ajustado)) {
            return valor_ajustado;
        }

        return 0;
    }, [amountNumber, ggrTable]);

    const submit = async () => {
        setSubmitting(true);
        setOrderResponse(null);
        setStatus(null);
        setApiError(null);
        setCopied(false);

        try {
            const payload = {
                cpf:
                    paymentType === "pix"
                        ? cpfValue.replace(/\D/g, "") || cpf
                        : "",
                type: paymentType,
                amount: Math.max(amountNumber, 0),
                typeWallet: walletType,
            };

            const data = (await createOrder(payload)) as OrderResponse;
            setOrderResponse(data);

            if (data?.idTransaction) setOrderId(String(data.idTransaction));
        } catch (e) {
            console.error(e);
            setApiError("Erro ao criar o pedido. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        const interval = setInterval(async () => {
            try {
                const data = await getOrderStatus(orderId);
                setStatus(data);

                if (data && !notifiedPaid) {
                    toast.success("Pagamento concluído!");
                    setNotifiedPaid(true);
                    clearInterval(interval);
                    setTimeout(() => {
                        router.refresh();
                        setOpen(false);
                        setOrderId("");
                    }, 1000);
                }
            } catch (e) {
                console.error("Erro ao verificar status do pedido:", e);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [orderId, notifiedPaid, router]);

    useEffect(() => {
        if (orderResponse?.url && paymentType === "crypto") {
            window.open(orderResponse.url, "_blank");
        }
    }, [orderResponse?.url, paymentType]);

    const hasOrder = !!orderResponse;

    const handleCopyPix = async () => {
        if (!orderResponse?.qrcode) return;
        try {
            await navigator.clipboard.writeText(orderResponse.qrcode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    };

    const resetFlow = () => {
        setOrderResponse(null);
        setOrderId("");
        setStatus(null);
        setSubmitting(false);
        setApiError(null);
        setCopied(false);
        setNotifiedPaid(false);
    };

    return (
        <Dialog
            open={disabled ? false : open}
            onOpenChange={(v) => !disabled && setOpen(v)}
        >
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    className={twMerge("w-full", triggerClassName)}
                >
                    Adicionar Saldo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-background-primary max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar Saldo</DialogTitle>
                    <DialogDescription>
                        Informe o valor e o método de pagamento. O GGR é
                        aplicado conforme a tabela.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-foreground/70">
                            Valor
                        </label>
                        <IMaskInput
                            mask={Number}
                            scale={2}
                            thousandsSeparator="."
                            padFractionalZeros={true}
                            normalizeZeros={true}
                            radix=","
                            inputMode="decimal"
                            placeholder="Ex: 100,00"
                            value={amount}
                            onAccept={(val: string) => setAmount(val)}
                            disabled={hasOrder || submitting}
                            max={20000}
                            className="w-full rounded-md border border-foreground/20 px-3 py-2 outline-hidden focus:ring-2 focus:ring-foreground/30"
                        />
                        <p className="text-xs text-foreground/60">
                            Mínimo sugerido:{" "}
                            {ggrTable.length
                                ? formatCurrencyBRL(
                                      Math.min(
                                          ...ggrTable.map((g) =>
                                              parseFloat(g.above)
                                          )
                                      )
                                  )
                                : formatCurrencyBRL(0)}
                        </p>
                        {amountNumber > 0 && amountNumber < minTable && (
                            <p className="text-xs text-[#E53935]">
                                Valor mínimo para esta carteira é{" "}
                                {formatCurrencyBRL(minTable)}
                            </p>
                        )}
                        {amountNumber > 20000 && (
                            <p className="text-xs text-[#E53935]">
                                Valor máximo permitido é R$ 20.000,00
                            </p>
                        )}
                    </div>

                    {!hasOrder && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1 p-3 rounded-md bg-foreground/5 border border-foreground/10">
                                <p className="text-foreground/60">
                                    Valor em ficha
                                </p>
                                <p className="font-semibold">
                                    {formatCurrencyBRL(fichaValue)}
                                </p>
                            </div>
                            <div className="space-y-1 p-3 rounded-md bg-foreground/5 border border-foreground/10">
                                <p className="text-foreground/60">
                                    GGR aplicado
                                </p>
                                <p className="font-semibold">{currentGgr}%</p>
                            </div>
                        </div>
                    )}

                    {!hasOrder && (
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Tabela GGR
                            </p>
                            <div className="space-y-2 max-h-40 overflow-auto pr-1">
                                {[...ggrTable]
                                    .sort(
                                        (a, b) =>
                                            parseFloat(b.above) -
                                            parseFloat(a.above)
                                    )
                                    .map((row) => (
                                        <div
                                            key={row.id}
                                            className={twMerge(
                                                "flex items-center justify-between text-sm border rounded-md px-3 py-2",
                                                amountNumber >=
                                                    parseFloat(row.above)
                                                    ? "border-[#95BD2B]/40 bg-[#95BD2B]/5"
                                                    : "border-foreground/10 bg-foreground/5"
                                            )}
                                        >
                                            <span>
                                                Acima de{" "}
                                                {formatCurrencyBRL(
                                                    parseFloat(row.above)
                                                )}
                                            </span>
                                            <span className="font-semibold">
                                                {row.tax}%
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

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
                                onClick={() =>
                                    !hasOrder && setPaymentType("pix")
                                }
                                disabled={hasOrder || submitting}
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
                                onClick={() =>
                                    !hasOrder && setPaymentType("crypto")
                                }
                                disabled={hasOrder || submitting}
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
                                disabled={hasOrder || submitting}
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
                                    {!orderResponse?.qrcode64 &&
                                        !orderResponse?.qrcode && (
                                            <p className="text-xs text-foreground/60">
                                                QR Code indisponível no momento.
                                                Tente novamente.
                                            </p>
                                        )}
                                </>
                            ) : orderResponse?.url ? (
                                <a
                                    className="text-sm underline text-primary"
                                    href={orderResponse.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Abrir link de pagamento
                                </a>
                            ) : (
                                <p className="text-xs text-foreground/60">
                                    Link de pagamento indisponível. Tente
                                    novamente.
                                </p>
                            )}
                            <div className="pt-2">
                                <button
                                    onClick={resetFlow}
                                    className="text-xs underline text-foreground/70"
                                >
                                    Gerar outro pagamento
                                </button>
                            </div>
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

                {apiError && <div className="text-[#E53935]">{apiError}</div>}

                <DialogFooter>
                    <Button
                        onClick={submit}
                        disabled={
                            submitting ||
                            amountNumber <= 0 ||
                            (amountNumber > 0 && amountNumber < minTable) ||
                            amountNumber > 10000 ||
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

export default AddBalanceDialog;
