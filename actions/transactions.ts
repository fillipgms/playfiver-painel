"use server";
import axios from "axios";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getTransactionsData(
    page: number = 1,
    search: string = ""
) {
    const session = await getSession();

    try {
        const { data } = await axios.get(
            `https://api.playfivers.com/api/panel/transactions?page=${page}&search=${encodeURIComponent(
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
        console.error("Failed to fetch transactions:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar transações")
        );
    }
}
