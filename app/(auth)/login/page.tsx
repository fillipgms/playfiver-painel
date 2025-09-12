"use client";
import Button from "@/components/Button";
import { useSession } from "@/contexts/SessionContext";
import { signIn } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const { refreshSession } = useSession();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        const formData = new FormData(e.target as HTMLFormElement);
        const result = await signIn(formData);
        if (result.success) {
            refreshSession();
            redirect("/");
        } else {
            setError(result.message || "Ocorreu um erro ao fazer login");
            if (result.errors) {
                setFieldErrors(result.errors);
            }
        }
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-background-secondary text-foreground">
            <div className="md:w-1/2 w-full flex justify-center items-center">
                <form onSubmit={onSubmit} className="space-y-8 w-xs">
                    <div>
                        <h1 className="font-bold text-xl">
                            Bem vindo de volta
                        </h1>
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

                        <div className="space-y-1">
                            <div className="flex flex-col gap-1">
                                <label
                                    className="capitalize"
                                    htmlFor="password"
                                >
                                    senha
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="w-full border py-1 rounded border-foreground/20 "
                                />
                                {fieldErrors.password && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.password[0]}
                                    </p>
                                )}
                            </div>
                            <Link
                                href={"/"}
                                className="underline text-primary flex gap-1 items-center"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <div className="text-sm text-[#E53935]">
                            {error && <p>Erro: {error}</p>}
                        </div>
                    </div>

                    <Button className="w-full">Entrar</Button>

                    <div className="w-full flex items-center gap-2">
                        <span className="w-full block h-0.5 bg-foreground/20 " />
                        <span className="text-sm">Ou</span>
                        <span className="w-full block h-0.5 bg-foreground/20 " />
                    </div>

                    <div className="flex gap-1 text-sm justify-center">
                        <p>Não tem uma conta?</p>
                        <Link
                            href="register"
                            className="underline text-primary flex gap-1 items-center"
                        >
                            Registre-se
                        </Link>
                    </div>
                </form>
            </div>
            <div className="md:w-1/2 w-full bg-radial from-primary to-[#005EBD] rounded-md overflow-hidden"></div>
        </main>
    );
}
