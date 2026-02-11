"use server";

import {
    loginSchema,
    registerSchema,
    codeEmailSchema,
    verifyCodeSchema,
} from "@/schemas";
import axios from "axios";
import { createSession, deleteSession } from "./session";
import { getSession } from "@/actions/user";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function requestVerificationCode(formData: FormData) {
    const validationResult = codeEmailSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
    });

    if (!validationResult.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo:",
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { name, email } = validationResult.data;

    try {
        const response = await axios({
            method: "post",
            url: `${BASE_URL}/auth/code-email-register`,
            data: { name, email },
        });

        if (response.status === 200) {
            return {
                success: true,
                message: "Código de verificação enviado para seu email.",
            };
        }

        return {
            success: false,
            message: "Resposta inesperada do servidor.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            const responseData = error.response.data;
            return {
                success: false,
                message: "Dados inválidos.",
                errors: {
                    name: [responseData.messages?.name || "Nome inválido."],
                    email: [responseData.messages?.email || "Email inválido."],
                },
            };
        }

        return {
            success: false,
            message: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        };
    }
}

export async function register(formData: FormData) {
    const validationResult = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!validationResult.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo:",
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validationResult.data;
    const verification_code = formData.get("verification_code") as string;

    const codeValidation = verifyCodeSchema.safeParse({ verification_code });
    if (!codeValidation.success) {
        return {
            success: false,
            message: "Código de verificação inválido.",
            errors: {
                verification_code: ["Código deve ter 6 dígitos"],
            },
        };
    }

    try {
        const response = await axios({
            method: "post",
            url: `${BASE_URL}/auth/register`,
            data: { name, email, password, verification_code },
        });

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message:
                    "Conta criada com sucesso! Você pode fazer login agora.",
            };
        }

        return {
            success: false,
            message: "Resposta inesperada do servidor.",
        };
    } catch (error) {
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (axios.isAxiosError(error) && error.response?.status === 422) {
            const responseData = error.response.data;
            return {
                success: false,
                message: "Dados inválidos.",
                errors: {
                    name: [responseData.messages?.name || "Nome inválido."],
                    email: [responseData.messages?.email || "Email inválido."],
                    password: [
                        responseData.messages?.password || "Senha inválida.",
                    ],
                    verification_code: [
                        responseData.messages?.verification_code ||
                            "Código inválido.",
                    ],
                },
            };
        }

        return {
            success: false,
            message:
                apiMessage ||
                "Ocorreu um erro inesperado. Por favor, tente novamente.",
        };
    }
}

export async function signIn(formData: FormData) {
    const validationResult = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validationResult.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo:",
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validationResult.data;

    try {
        const response = await axios({
            method: "post",
            url: `${BASE_URL}/auth/login`,
            data: { email, password },
        });

        if (response.status === 200 && response.data.access_token) {
            const { access_token, token_type, expires_in } = response.data;
            await createSession(access_token, token_type, expires_in);
            return {
                success: true,
                message: "Login realizado com sucesso.",
            };
        }

        return {
            success: false,
            message: "Resposta inesperada do servidor.",
        };
    } catch (error) {
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            const responseData = error.response.data;
            return {
                success: false,
                message: "Email ou senha inválidos.",
                errors: {
                    email: [responseData.messages?.email || "Email inválido."],
                    password: [
                        responseData.messages?.password || "Senha inválida.",
                    ],
                },
            };
        }

        return {
            success: false,
            message:
                apiMessage ||
                "Ocorreu um erro inesperado. Por favor, tente novamente.",
        };
    }
}

export async function logout(): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        const session = await getSession();

        if (!session?.accessToken) {
            await deleteSession();
            return {
                success: true,
                message: "No active session found. Cleared local session.",
            };
        }

        const response = await axios.post(
            `${BASE_URL}/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (response.status === 200) {
            await deleteSession();
            return {
                success: true,
                message: "Logout successful",
            };
        }

        return {
            success: false,
            message: "Unexpected response from server",
        };
    } catch (error) {
        console.error("Error in logout:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await deleteSession();
                return {
                    success: true,
                    message: "Session expired. Cleared local session.",
                };
            }

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to logout from server",
            };
        }

        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        return {
            success: false,
            message: apiMessage || "An unexpected error occurred during logout",
        };
    }
}
