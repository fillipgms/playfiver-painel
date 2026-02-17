"use server";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function registerOptions() {
    try {
        const { data } = await axios.get(
            `${BASE_URL}/auth/meta/register-options`,
            {
                timeout: 30000,
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

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar agentes"),
        );
    }
}

interface UpdateUserDataParams {
    nationality: string;
    country: string;
    phone: string;
    lang: string;
    document?: string;
}

export async function updateUserData({
    nationality,
    country,
    phone,
    lang,
    document,
}: UpdateUserDataParams) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `${BASE_URL}/auth/data-update`,
            {
                nationality,
                country,
                phone,
                lang,
                ...(document && { document }),
            },
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
        console.error("Failed to update user data:", error);
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
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao atualizar dados do usuário",
                ),
        );
    }
}
