"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getTransactionsData(
    page: number = 1,
    search: string = "",
    dateStart: string = "",
    dateEnd: string = "",
    agent: string = ""
) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        let url = `https://api.testeplayfiver.com/api/panel/transactions?page=${page}&search=${encodeURIComponent(
            search
        )}&agent=${encodeURIComponent(agent)}`;

        if (dateStart) {
            const date = new Date(dateStart);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:00`;
            url += `&dateStart=${encodeURIComponent(formattedDate)}`;
        }

        if (dateEnd) {
            const date = new Date(dateEnd);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:00`;
            url += `&dateEnd=${encodeURIComponent(formattedDate)}`;
        }

        const { data } = await axios.get(url, {
            timeout: 5000,
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
        console.error("Failed to fetch transactions:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar transações")
        );
    }
}
