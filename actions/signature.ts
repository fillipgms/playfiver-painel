"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getSignatureData() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            "https://api.playfivers.com/api/panel/signature",
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch home data:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        // Check if it's an auth error and redirect
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar dados da home"
                )
        );
    }
}

export async function createInfluencerOrder(payload: {
    cpf: string;
    typeMethod: "pix" | "crypto";
    quantity: number;
    type: "inf";
    idAgent: number;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const processedPayload = {
        ...payload,
        cpf:
            payload.typeMethod === "crypto" &&
            (!payload.cpf || payload.cpf.trim() === "")
                ? "00000000000"
                : payload.cpf,
    };

    try {
        const { data } = await axios.post(
            "https://api.playfivers.com/api/panel/signature",
            processedPayload,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to create influencer order:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao criar pedido de influencer"
                )
        );
    }
}

export async function getInfluencerOrderStatus(id: string | number) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `https://api.playfivers.com/api/panel/order?id=${id}`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        return data;
    } catch (error) {
        console.error("Failed to fetch influencer order status:", error);

        // Check if it's an auth error and redirect
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        // HTTP 500 - Pagamento ainda não processado, continua o polling
        if (axios.isAxiosError(error) && error.response?.status === 500) {
            return null; // Continua o polling
        }

        // Outros erros também continuam o polling
        return null;
    }
}
