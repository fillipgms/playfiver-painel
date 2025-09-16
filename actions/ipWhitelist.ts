"use server";
import axios from "axios";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getIpWhitelist(page: number = 1, search: string = "") {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            `https://api.playfivers.com/api/panel/ip?page=${page}&search=${encodeURIComponent(
                search
            )}`,
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
        console.error("Failed to fetch IP whitelist:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar IP whitelist"
                )
        );
    }
}

export async function createNewIp(payload: { ip: string }) {
    const session = await getSession();

    try {
        const { data } = await axios.post(
            `https://api.playfivers.com/api/panel/ip`,
            payload,
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
        console.error("Failed to create new IP on whitelist:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao criar essa regra de IP"
                )
        );
    }
}

export async function deleteIp(id: number) {
    const session = await getSession();

    try {
        const { data } = await axios.delete(
            `https://api.playfivers.com/api/panel/ip/${id}`,
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
        console.error("Failed to delete IP from whitelist:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao deletar IP da whitelist"
                )
        );
    }
}
