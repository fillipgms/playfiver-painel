import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string(),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        nationality: z
            .string()
            .min(2, "Nacionalidade deve ter pelo menos 2 caracteres"),
        country: z.string().min(2, "País deve ter pelo menos 2 caracteres"),
        phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
        lang: z.string().min(2, "Idioma deve ter pelo menos 2 caracteres"),
        document: z
            .string()
            .min(5, "Documento deve ter pelo menos 5 caracteres"),
        password: z.string(),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

export const codeEmailSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
});

export const verifyCodeSchema = z.object({
    verification_code: z.string().length(6, "Código deve ter 6 dígitos"),
});
