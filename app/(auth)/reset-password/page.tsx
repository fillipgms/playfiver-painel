"use client";
import Button from "@/components/Button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetPassword = () => {
        setError(null);
        setSuccess(null);
        setFieldErrors({});
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-background-secondary text-foreground">
            <div className="md:w-1/2 w-full flex justify-center items-center">
                <form onSubmit={resetPassword} className="space-y-8 w-xs">
                    <div>
                        <h1 className="font-bold text-xl">Criar Conta</h1>
                        <p className="text-sm text-foreground/70">
                            Preencha os dados abaixo para criar sua conta
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="capitalize" htmlFor="name">
                                Nome
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="w-full border py-1 rounded border-foreground/20"
                                required
                            />
                            {fieldErrors.name && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.name[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="capitalize" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="w-full border py-1 rounded border-foreground/20"
                                required
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

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

                    <Button className="w-full">Solicitar Código</Button>

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
