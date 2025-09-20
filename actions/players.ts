"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getPlayersData(page: number = 1, search: string = "") {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `https://api.playfivers.com/api/panel/player?page=${page}&search=${encodeURIComponent(
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
        console.error("Failed to fetch players:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores")
        );
    }
}

export async function updatePlayer(params: {
    id: number;
    rtp?: string;
    influencer?: number;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const payload: { id: number; rtp?: string; influencer?: number } = {
            id: params.id,
        };

        if (typeof params.rtp !== "undefined") payload.rtp = params.rtp;
        if (typeof params.influencer !== "undefined")
            payload.influencer = params.influencer;

        const { data } = await axios.put(
            `https://api.playfivers.com/api/panel/player`,
            payload,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );
        // Normalize successful response
        return {
            success: true,
            message:
                (data && (data.msg || data.message)) ||
                "Jogador atualizado com sucesso",
            data,
        } as const;
    } catch (error) {
        console.error("Failed to update player:", error);
        const err = error as {
            response?: {
                status?: number;
                data?: { msg?: string; message?: string };
            };
        };
        const apiMessage =
            err?.response?.data?.msg || err?.response?.data?.message;
        // Check if it's an auth error and redirect
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            success: false,
            status: err?.response?.status,
            message:
                apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao atualizar jogador"
                ),
        } as const;
    }
}
