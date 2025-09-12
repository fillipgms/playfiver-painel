"use server";

import axios from "axios";
import { cookies } from "next/headers";

export async function sendCode(email: string) {
    try {
        const response = await axios.get(
            `https://api.testeplayfiver.com/api/auth/login/code`,
            { params: { email } }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 422) {
                throw new Error("Email inválido ou formato incorreto");
            }
            if (error.response?.status === 429) {
                throw new Error(
                    "Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente."
                );
            }
            if (error.response?.status === 404) {
                throw new Error(
                    "Usuário não encontrado. Verifique se o email está correto."
                );
            }
            if (error.response?.status === 500) {
                throw new Error(
                    "Erro no servidor. Por favor, tente novamente mais tarde."
                );
            }
            throw new Error(
                `Erro ao enviar código: ${
                    error.response?.data?.message || error.message
                }`
            );
        }
        throw new Error("Erro ao enviar código. Por favor, tente novamente.");
    }
}

export async function getUser() {
    const cookie = (await cookies()).get("session")?.value;

    if (!cookie) {
        return null;
    }

    try {
        const session = JSON.parse(cookie) as SessionPayload;

        const { data } = await axios.get(
            `https://api.testeplayfiver.com/api/auth/me`,
            {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            }
        );
        return data as User;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                (await cookies()).delete("session");
                throw new Error(
                    "Sessão expirada. Por favor, faça login novamente."
                );
            }
        }

        console.error("Failed to get user:", error);

        return null;
    }
}

export async function getSession() {
    const cookie = (await cookies()).get("session")?.value;
    if (!cookie) {
        return null;
    }
    return JSON.parse(cookie) as SessionPayload;
}
