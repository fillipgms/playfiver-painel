"use client";
import Button from "@/components/Button";
import { useSession } from "@/contexts/SessionContext";
import {
    DownloadIcon,
    EnvelopeIcon,
    UserIcon,
    LockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { updateProfile } from "@/actions/profile";

import { forgotPassword } from "@/actions/user";

export default function ProfilePage() {
    const { user, loading } = useSession();

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
        currency: user?.currency || "",
        balance: user?.balance || "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { refreshSession } = useSession();

    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setForm({
                name: user?.name || "",
                email: user?.email || "",
                role: user?.role || "",
                currency: user?.currency || "",
                balance: user?.balance || "",
            });
        }
    }, [user]);

    useEffect(() => {
        const hasFormChanges =
            form.name !== (user?.name || "") ||
            form.email !== (user?.email || "");
        setHasChanges(hasFormChanges);
    }, [form, user]);

    const handleSave = async () => {
        setIsSaving(true);

        const result = await updateProfile(form.name, form.email);

        if (result.status === 1) {
            setSuccess(result.message);
            setIsSaving(false);
            setIsEditing(false);
            await refreshSession();
        } else {
            setError(result.message);
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "",
            currency: user?.currency || "",
            balance: user?.balance || "",
        });
        setIsEditing(false);
    };

    const handleDownload = () => {
        try {
            const data = {
                nome: form.name,
                email: form.email,
                cargo: form.role,
                currency: form.currency,
                balance: form.balance,
                exported_at: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const safeCode = (user?.name || "usuario").replace(
                /[^a-z0-9_-]/gi,
                "_"
            );
            link.download = `agent-profile-${safeCode}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (error) {
            console.error("Erro ao gerar download:", error);
        }
    };

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-background-secondary rounded-xl p-6 border border-foreground/10 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-foreground/10 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-6 w-32 bg-foreground/10 rounded"></div>
                            <div className="h-4 w-20 bg-foreground/10 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="h-6 w-40 bg-foreground/10 rounded"></div>
                        <div className="h-4 w-60 bg-foreground/10 rounded"></div>
                    </div>
                    <div className="col-span-2 bg-background-secondary rounded-xl p-6 border border-foreground/10 animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="h-4 w-12 bg-foreground/10 rounded"></div>
                                <div className="h-10 w-full bg-foreground/10 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-16 bg-foreground/10 rounded"></div>
                                <div className="h-10 w-full bg-foreground/10 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="space-y-6">
            <section className="bg-background-secondary rounded-xl p-6 border border-foreground/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-13 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                            {user?.name ? getUserInitials(user.name) : "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {user?.name}
                            </h1>
                            <p className="text-sm text-foreground/60">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            id="download-infos"
                            variant="secondary"
                            onClick={handleDownload}
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Baixar Informações
                        </Button>
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                disabled={loading}
                            >
                                Editar Perfil
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                >
                                    {isSaving
                                        ? "Salvando..."
                                        : "Salvar Alterações"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Informações Pessoais
                    </h2>
                    <p className="text-foreground/50 text-sm">
                        Fique à vontade para editar suas informações pessoais.
                    </p>
                    {success && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <XCircleIcon className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
                <section className="bg-background-secondary col-span-2 rounded-xl p-6 border border-foreground/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium text-foreground"
                            >
                                Nome
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    disabled={!isEditing}
                                    className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                E-mail
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={!isEditing}
                                    className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            </div>
                        </div>

                        <div className="col-span-2 w-full flex justify-between items-center p-4 bg-foreground/5 rounded-lg border border-foreground/10">
                            <div className="flex items-center gap-3">
                                <LockIcon className="w-5 h-5 text-foreground/60" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Recuperar Senha
                                    </p>
                                    <p className="text-xs text-foreground/60">
                                        Alterar sua senha de acesso
                                    </p>
                                </div>
                            </div>
                            <button
                                className="text-sm cursor-pointer text-primary hover:text-primary/80 underline transition-colors"
                                onClick={() => {
                                    forgotPassword(form.email).then(
                                        (result) => {
                                            if (result.status === 1) {
                                                setSuccess(result.message);
                                            } else {
                                                setError(result.message);
                                            }
                                        }
                                    );
                                }}
                            >
                                Enviar email de recuperação
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
