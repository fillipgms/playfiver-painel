"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getOrdersData() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            "https://api.playfivers.com/api/panel/orders?page=1",
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
        console.error("Failed to fetch consuption data:", error);
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
                    "Falha ao buscar dados do seu consumo"
                )
        );
    }
}

export async function createOrder(payload: {
    cpf: string;
    type: "pix" | "crypto";
    amount: number;
    typeWallet: number;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const processedPayload = {
        ...payload,
        cpf:
            payload.type === "crypto" &&
            (!payload.cpf || payload.cpf.trim() === "")
                ? "00000000000"
                : payload.cpf,
    };

    try {
        const { data } = await axios.post(
            "https://api.playfivers.com/api/panel/order",
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

        console.log(data);

        return data;
    } catch (error) {
        console.error("Failed to create order:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao criar pedido")
        );
    }
}

export async function getOrderStatus(id: string | number) {
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
        console.error("Failed to fetch order status:", error);

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        if (axios.isAxiosError(error) && error.response?.status === 500) {
            return null;
        }

        return null;
    }
}
