"use client";

import { forgotPassword } from "@/actions/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setSubmitting(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const result = await forgotPassword(formData.get("email") as string);

        if (!result.status) {
            setSuccess(result.message || "Código enviado para seu email");
        } else {
            setError(result.message || "Ocorreu um erro ao esquecer a senha");
        }
        setSubmitting(false);
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-background-secondary text-foreground">
            <div className="md:w-1/2 w-full flex justify-center items-center">
                <form onSubmit={onSubmit} className="space-y-8 w-xs">
                    <div>
                        <h1 className="font-bold text-xl">Esqueceu a senha?</h1>
                        <p></p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="capitalize" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="w-full border py-1 rounded border-foreground/20  "
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="text-sm text-[#E53935]">
                            {error && <p>Erro: {error}</p>}
                        </div>

                        <div className="text-sm text-green-600">
                            {success && <p>{success}</p>}
                        </div>
                    </div>

                    <Button
                        className="w-full cursor-pointer"
                        disabled={submitting}
                    >
                        <div>
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Enviando...
                                </div>
                            ) : (
                                <div>Enviar código</div>
                            )}
                        </div>
                    </Button>

                    <div className="w-full flex items-center gap-2">
                        <span className="w-full block h-0.5 bg-foreground/20 " />
                        <span className="text-sm">Ou</span>
                        <span className="w-full block h-0.5 bg-foreground/20 " />
                    </div>

                    <div className="flex gap-1 text-sm justify-center">
                        <p>Recebeu o código?</p>
                        <Link
                            href="login"
                            className="underline text-primary flex gap-1 items-center"
                        >
                            Faça login
                        </Link>
                    </div>
                </form>
            </div>
            <div className="md:w-1/2 w-full bg-radial from-primary to-[#005EBD] rounded-md overflow-hidden"></div>
        </main>
    );
}
