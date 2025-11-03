"use client";
import Button from "@/components/Button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { requestVerificationCode, register, signIn } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState<"form" | "verification">("form");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [verificationCode, setVerificationCode] = useState("");

    const onRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setFieldErrors({});

        const formDataObj = new FormData(e.target as HTMLFormElement);
        const result = await requestVerificationCode(formDataObj);

        if (result.success) {
            setFormData({
                name: formDataObj.get("name") as string,
                email: formDataObj.get("email") as string,
                password: formDataObj.get("password") as string,
                confirmPassword: formDataObj.get("confirmPassword") as string,
            });
            setSuccess(result.message);
            setStep("verification");
        } else {
            setError(result.message || "Ocorreu um erro ao solicitar o código");
            if (result.errors) {
                setFieldErrors(result.errors);
            }
        }
    };

    const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setFieldErrors({});

        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("email", formData.email);
        formDataObj.append("password", formData.password);
        formDataObj.append("confirmPassword", formData.confirmPassword);
        formDataObj.append("verification_code", verificationCode);

        const result = await register(formDataObj);

        if (result.success) {
            const result = await signIn(formDataObj);
            if (result.success) {
                router.push("/");
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
    };

    const goBackToForm = () => {
        setStep("form");
        setError(null);
        setSuccess(null);
        setFieldErrors({});
        setVerificationCode("");
    };

    if (step === "verification") {
        return (
            <main className="h-screen flex p-8 gap-8 bg-linear-to-b from-primary/50 to-background-primary items-center justify-center text-foreground">
                <div className="flex justify-center items-center bg-background-secondary rounded-md shadow p-8 h-fit">
                    <form onSubmit={onRegister} className="space-y-8 w-xs">
                        <div>
                            <h1 className="font-bold text-xl">
                                Verificação de Email
                            </h1>
                            <p className="text-sm text-foreground/70">
                                Digite o código de 6 dígitos enviado para{" "}
                                {formData.email}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Código de Verificação
                                </label>
                                <InputOTP
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(value) =>
                                        setVerificationCode(value)
                                    }
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                {fieldErrors.verification_code && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.verification_code[0]}
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

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={goBackToForm}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={verificationCode.length !== 6}
                            >
                                Criar Conta
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="md:w-1/2 w-full bg-radial from-primary to-[#005EBD] rounded-md overflow-hidden"></div>
            </main>
        );
    }

    return (
        <main className="h-screen flex p-8 gap-8 bg-linear-to-b from-primary/50 to-background-primary items-center justify-center text-foreground">
            <div className="flex justify-center items-center bg-background-secondary rounded-md shadow p-8 h-fit">
                <form onSubmit={onRequestCode} className="space-y-8 w-xs">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label
                                    className="capitalize"
                                    htmlFor="password"
                                >
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
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
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
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
        </main>
    );
}
