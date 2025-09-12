import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
        confirmPassword: z
            .string()
            .min(8, "Confirmação de senha deve ter pelo menos 8 caracteres"),
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
