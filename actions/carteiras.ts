"use server";
import axios from "axios";
import { getSession } from "./user";
import {
    getFriendlyHttpErrorMessage,
    redirectOnAuthError,
} from "@/lib/httpError";

export async function getWalletsData() {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            "https://api.playfivers.com/api/panel/wallet",
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
        console.error("Failed to fetch wallets:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        await redirectOnAuthError(error);

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar carteiras")
        );
    }
}

export async function getWalletGGr(id: number) {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            `https://api.playfivers.com/api/panel/ggr?type=${id}`,
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
        console.error("Failed to fetch GGR:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        await redirectOnAuthError(error);

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar GGR")
        );
    }
}
