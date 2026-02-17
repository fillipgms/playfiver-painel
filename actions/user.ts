"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendCode(email: string) {
    try {
        const response = await axios.get(`${BASE_URL}/auth/login/code`, {
            params: { email },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 422) {
                throw new Error("Email inválido ou formato incorreto");
            }
            if (error.response?.status === 429) {
                throw new Error(
                    "Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.",
                );
            }
            if (error.response?.status === 404) {
                throw new Error(
                    "Usuário não encontrado. Verifique se o email está correto.",
                );
            }
            if (error.response?.status === 500) {
                throw new Error(
                    "Erro no servidor. Por favor, tente novamente mais tarde.",
                );
            }
            throw new Error(
                `Erro ao enviar código: ${
                    error.response?.data?.message || error.message
                }`,
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

        const { data } = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        console.log(data);

        return data as User;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await clearExpiredSession();
                throw new Error(
                    "Sessão expirada. Por favor, faça login novamente.",
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

    try {
        const session = JSON.parse(cookie) as SessionPayload;

        const expires = new Date(session.expires);
        if (expires < new Date()) {
            await clearExpiredSession();
            return null;
        }

        return session;
    } catch (error: unknown) {
        console.error("Failed to get session:", error);
        await clearExpiredSession();
        return null;
    }
}

export async function clearExpiredSession() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function clearSessionAndRedirect() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/login");
}

export async function forgotPassword(email: string) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
            email: email,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await clearExpiredSession();
                throw new Error(
                    "Sessão expirada. Por favor, faça login novamente.",
                );
            }
        }

        console.error("Failed to get user:", error);

        return null;
    }
}

export async function resetPassword(
    email: string,
    password: string,
    password_confirmation: string,
    code: string,
) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
            email: email,
            password: password,
            password_confirmation: password_confirmation,
            token: code,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await clearExpiredSession();
                throw new Error(
                    "Sessão expirada. Por favor, faça login novamente.",
                );
            }
        }

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 500) {
                await clearExpiredSession();
                throw new Error(
                    "Link inválido. Por favor, solicite um novo link de redefinição de senha.",
                );
            }
        }

        console.error("Failed to reset password:", error);
        return null;
    }
}
