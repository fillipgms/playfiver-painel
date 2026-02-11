"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getLogsData(
    page: number = 1,
    dateStart: string = "",
    dateEnd: string = "",
    agent: string = "",
) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        let url = `${BASE_URL}/panel/logs?page=${page}&agent=${agent}`;

        if (dateStart) {
            const date = new Date(dateStart);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            const formattedDate = `${month}/${day}/${year} 00:00:00`;
            url += `&dateStart=${encodeURIComponent(formattedDate)}`;
        }

        if (dateEnd) {
            const date = new Date(dateEnd);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            const formattedDate = `${month}/${day}/${year} 23:59:59`;
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
        console.error("Failed to fetch logs data:", error);
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
                    "Falha ao buscar dados dos logs",
                ),
        );
    }
}
