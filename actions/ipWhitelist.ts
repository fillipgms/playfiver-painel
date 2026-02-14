"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getIpWhitelist(page: number = 1, search: string = "") {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `${BASE_URL}/panel/ip?page=${page}&search=${encodeURIComponent(
                search,
            )}`,
            {
                timeout: 30000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch IP whitelist:", error);
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
                    "Falha ao buscar IP whitelist",
                ),
        );
    }
}

export async function createNewIp(payload: { ip: string }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.post(`${BASE_URL}/panel/ip`, payload, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to create new IP on whitelist:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao criar essa regra de IP";

        if (apiMessage) {
            if (
                apiMessage.toLowerCase().includes("duplicate") ||
                apiMessage.toLowerCase().includes("already exists") ||
                apiMessage.toLowerCase().includes("já existe")
            ) {
                errorMessage = "Este endereço IP já existe na whitelist";
            } else if (
                apiMessage.toLowerCase().includes("invalid") ||
                apiMessage.toLowerCase().includes("inválido")
            ) {
                errorMessage = "Endereço IP inválido";
            } else {
                errorMessage = apiMessage;
            }
        } else {
            errorMessage = getFriendlyHttpErrorMessage(
                error,
                "Falha ao criar essa regra de IP",
            );
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function deleteIp(id: number) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.delete(`${BASE_URL}/panel/ip/${id}`, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to delete IP from whitelist:", error);
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
                    "Falha ao deletar IP da whitelist",
                ),
        );
    }
}
