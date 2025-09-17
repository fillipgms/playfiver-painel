"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

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
            `https://api.testeplayfiver.com/api/panel/agentes?page=${page}&search=${encodeURIComponent(
                search
            )}`,
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar agentes")
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
            "https://api.testeplayfiver.com/api/panel/agentes",
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
            }
        );

        console.log(data);

        if (!data) {
            throw new Error("No valid data received from API");
        }
        return data;
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

            throw new Error(
                apiMessage ||
                    getFriendlyHttpErrorMessage(error, "Falha ao criar agente")
            );
        }
    }
}

export async function updateAgent(
    agentId: number,
    payload: CreateOrUpdateAgentPayload
) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `https://api.testeplayfiver.com/api/panel/agentes/`,
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
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }
        return data;
    } catch (error) {
        console.error("Failed to create agent:", error);

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
                getFriendlyHttpErrorMessage(error, "Falha ao criar agente")
        );
    }
}

export async function deleteAgent(agentId: number) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.delete(
            `https://api.testeplayfiver.com/api/panel/agentes/${agentId}`,
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
                getFriendlyHttpErrorMessage(error, "Falha ao excluir agente")
        );
    }
}
