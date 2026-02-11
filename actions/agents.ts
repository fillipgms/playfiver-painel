"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getAgentsData({
    page = 1,
    search = "",
}: {
    page?: number;
    search?: string;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `${BASE_URL}/panel/agentes?page=${page}&search=${encodeURIComponent(
                search,
            )}`,
            {
                timeout: 5000,
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
        console.error("Failed to fetch agents:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar agentes"),
        );
    }
}

export type CreateOrUpdateAgentPayload = {
    agent_memo: string;
    agent_code: string;
    password?: string;
    rtp: string | number;
    rtp_user?: string | number;
    url: string;
    currency: string;
    bonus_enable: boolean | number;
    limit_enable?: boolean | number;
    limit_amount?: string | number;
    limit_hours?: string | number;
};

export async function createAgent(payload: CreateOrUpdateAgentPayload) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.post(
            `${BASE_URL}/panel/agentes`,
            {
                agent_memo: payload.agent_memo,
                agent_code: payload.agent_code,
                password: payload.password ?? "",
                rtp: payload.rtp,
                url: payload.url,
                currency: payload.currency,
                bonus_enable: payload.bonus_enable === true ? 1 : 0,
            },
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }
        return { success: true, data };
    } catch (error: unknown) {
        if (error) {
            console.error("Failed to create agent:", error);

            const apiMessage = (
                error as { response?: { data?: { msg?: string } } }
            )?.response?.data?.msg;

            // Check if it's an auth error and redirect
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 401 ||
                    error.response?.status === 403)
            ) {
                redirect("/login");
            }

            let errorMessage = "Falha ao criar agente";

            if (apiMessage) {
                if (
                    apiMessage.toLowerCase().includes("duplicate") ||
                    apiMessage.toLowerCase().includes("already exists") ||
                    apiMessage.toLowerCase().includes("já existe") ||
                    apiMessage.toLowerCase().includes("agent_code")
                ) {
                    errorMessage = "Este código de agente já existe";
                } else if (
                    apiMessage.toLowerCase().includes("invalid") ||
                    apiMessage.toLowerCase().includes("inválido")
                ) {
                    errorMessage = "Dados inválidos fornecidos";
                } else {
                    errorMessage = apiMessage;
                }
            } else {
                errorMessage = getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao criar agente",
                );
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}

export async function updateAgent(
    agentId: number,
    payload: CreateOrUpdateAgentPayload,
) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `${BASE_URL}/panel/agentes/`,
            {
                id_agente: agentId,
                agent_memo: payload.agent_memo,
                agent_code: payload.agent_code,
                password: payload.password ?? "",
                rtp: payload.rtp,
                rtp_user: payload.rtp_user,
                url: payload.url,
                currency: payload.currency,
                bonus_enable: payload.bonus_enable === true ? 1 : 0,
                limit_enable: payload.limit_enable === true ? 1 : 0,
                limite_amount: payload.limit_amount,
                limit_hours: payload.limit_hours,
            },
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }
        return { success: true, data };
    } catch (error) {
        console.error("Failed to update agent:", error);

        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        // Check if it's an auth error and redirect
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        // Return error object instead of throwing
        let errorMessage = "Falha ao atualizar agente";

        if (apiMessage) {
            // Check for common error patterns and provide user-friendly messages
            if (
                apiMessage.toLowerCase().includes("duplicate") ||
                apiMessage.toLowerCase().includes("already exists") ||
                apiMessage.toLowerCase().includes("já existe") ||
                apiMessage.toLowerCase().includes("agent_code")
            ) {
                errorMessage = "Este código de agente já existe";
            } else if (
                apiMessage.toLowerCase().includes("invalid") ||
                apiMessage.toLowerCase().includes("inválido")
            ) {
                errorMessage = "Dados inválidos fornecidos";
            } else {
                errorMessage = apiMessage;
            }
        } else {
            errorMessage = getFriendlyHttpErrorMessage(
                error,
                "Falha ao atualizar agente",
            );
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function deleteAgent(agentId: number) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.delete(
            `${BASE_URL}/panel/agentes/${agentId}`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        return data;
    } catch (error) {
        console.error("Failed to delete agent:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao excluir agente"),
        );
    }
}
