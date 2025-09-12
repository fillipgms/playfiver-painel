"use server";
import axios from "axios";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getOrdersData() {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            "https://api.testeplayfiver.com/api/panel/orders?page=1",
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
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

    try {
        const { data } = await axios.post(
            "https://api.testeplayfiver.com/api/panel/order",
            payload,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to create order:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao criar pedido")
        );
    }
}

export async function getOrderStatus(id: string | number) {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            `https://api.testeplayfiver.com/api/panel/order?id=${id}`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch order status:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar status do pedido"
                )
        );
    }
}
