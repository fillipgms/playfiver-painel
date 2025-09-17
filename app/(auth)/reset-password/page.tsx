"use client";
import Button from "@/components/Button";
import { Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/user";
import { signIn } from "@/lib/auth";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <p>Carregando suas informações...</p>
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const passwordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setFieldErrors({});
        setSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!token || !email) {
            setError("Token ou e-mail inválido");
            setSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors({
                confirmPassword: ["As senhas não coincidem"],
            });
            setSubmitting(false);
            return;
        }

        const result = await resetPassword(
            email,
            password,
            confirmPassword,
            token
        );

        if (result.success) {
            const result = await signIn(formData);
            if (result.success) {
                redirect("/");
            } else {
                setError(result.message || "Ocorreu um erro ao fazer login");
                if (result.errors) {
                    setFieldErrors(result.errors);
                }
            }
        } else {
            setError(result.message || "Ocorreu um erro ao criar a conta");
            if (result.errors) {
                setFieldErrors(result.errors as Record<string, string[]>);
            }
        }

        setSubmitting(false);
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-background-secondary text-foreground">
            <div className="md:w-1/2 w-full flex justify-center items-center">
                <form onSubmit={passwordReset} className="space-y-8 w-xs">
                    <div>
                        <h1 className="font-bold text-xl">Alterar Senha</h1>
                        <p className="text-sm text-foreground/70">
                            Altera a senha para: {email}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="capitalize" htmlFor="password">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    className="w-full border py-1 rounded border-foreground/20 pr-9"
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Ocultar senha"
                                            : "Mostrar senha"
                                    }
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-2 flex items-center text-foreground/70 hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.password[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                className="capitalize"
                                htmlFor="confirmPassword"
                            >
                                Repetir Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    className="w-full border py-1 rounded border-foreground/20 pr-9"
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Ocultar confirmação"
                                            : "Mostrar confirmação"
                                    }
                                    onClick={() =>
                                        setShowConfirmPassword((v) => !v)
                                    }
                                    className="absolute inset-y-0 right-2 flex items-center text-foreground/70 hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.confirmPassword[0]}
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

                    <Button className="w-full">
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Alterando...
                            </div>
                        ) : (
                            <div>Alterar senha</div>
                        )}
                    </Button>

                    <div className="w-full flex items-center gap-2">
                        <span className="w-full block h-0.5 bg-foreground/20" />
                        <span className="text-sm">Ou</span>
                        <span className="w-full block h-0.5 bg-foreground/20" />
                    </div>

                    <div className="flex gap-1 text-sm justify-center">
                        <p>Já tem uma conta?</p>
                        <Link
                            href="/login"
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
