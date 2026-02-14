"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function updateProfile(name: string, email: string) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `${BASE_URL}/panel/profile`,
            { name: name, email: email },
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
        console.error("Failed to update profile:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao atualizar perfil"),
        );
    }
}
