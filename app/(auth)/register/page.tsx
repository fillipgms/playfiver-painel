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
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerOptions } from "@/actions/meta";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Country {
    iso2: string;
    name_en: string;
    name_pt: string;
    value: string;
}

interface Language {
    code: string;
    name_en: string;
    name_pt: string;
    value: string;
}

interface CountryCode {
    cca2: string;
    callingCode: string;
    name_pt: string;
}

interface RestCountryIDD {
    cca2: string;
    idd: {
        root: string;
        suffixes: string[];
    };
}

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {},
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
    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
    const [selectedNationality, setSelectedNationality] = useState("");
    const [selectedCountryCode, setSelectedCountryCode] = useState("");
    const [selectedLang, setSelectedLang] = useState("");
    const [phone, setPhone] = useState("");
    const [document, setDocument] = useState("");

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
        formDataObj.append("nationality", selectedNationality);
        formDataObj.append("country", selectedCountryCode);
        formDataObj.append("lang", selectedLang);
        formDataObj.append("phone", phone);
        formDataObj.append("document", document);

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

    useEffect(() => {
        const getRegisterOptions = async () => {
            try {
                const res = await registerOptions();
                setCountries(res.countries || []);
                setLanguages(res.languages || []);

                const codesRes = await fetch(
                    "https://restcountries.com/v3.1/all?fields=cca2,idd",
                );
                const codesData = await codesRes.json();

                const processedCodes: CountryCode[] = codesData
                    .map((item: RestCountryIDD) => {
                        const root = item.idd?.root || "";
                        const suffixes = item.idd?.suffixes || [];

                        if (!root || suffixes.length === 0) return null;

                        const callingCode = root + suffixes[0];

                        const country = res.countries?.find(
                            (c: Country) => c.iso2 === item.cca2,
                        );

                        return {
                            cca2: item.cca2,
                            callingCode,
                            name_pt: country?.name_pt || item.cca2,
                        };
                    })
                    .filter(Boolean)
                    .sort((a: CountryCode, b: CountryCode) =>
                        a.name_pt.localeCompare(b.name_pt),
                    );

                setCountryCodes(processedCodes);
            } catch (err) {
                console.error(err);
                setError("Falha ao carregar opções");
            }
        };

        getRegisterOptions();
    }, []);

    useEffect(() => {
        if (selectedNationality && countryCodes.length > 0) {
            const nationalityCountry = countries.find(
                (c) => c.name_en === selectedNationality,
            );
            if (nationalityCountry) {
                const matchingCode = countryCodes.find(
                    (cc) => cc.cca2 === nationalityCountry.iso2,
                );
                if (matchingCode && !selectedCountryCode) {
                    setSelectedCountryCode(matchingCode.cca2);
                }
            }
        }
    }, [selectedNationality, countryCodes, countries, selectedCountryCode]);

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6)
            return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9)
            return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (selectedCountryCode === "BR") {
            if (numbers.length <= 2) return numbers;
            if (numbers.length <= 6)
                return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
            if (numbers.length <= 10)
                return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
        return numbers;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setPhone(formatted);
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setDocument(formatted);
    };

    const goBackToForm = () => {
        setStep("form");
        setError(null);
        setSuccess(null);
        setFieldErrors({});
        setVerificationCode("");
    };

    const isBrazilian = selectedNationality === "Brazil";

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
            <div className="flex justify-center items-center bg-background-secondary rounded-md shadow  h-fit">
                <div className="max-h-96 overflow-y-auto p-8">
                    <form onSubmit={onRequestCode} className="space-y-8 w-xs">
                        <div className="text-center">
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Nacionalidade *
                                </label>
                                <Select
                                    value={selectedNationality}
                                    onValueChange={setSelectedNationality}
                                >
                                    <SelectTrigger className="w-full h-10 border-foreground/20 bg-background-secondary">
                                        <div className="flex items-center gap-2">
                                            <SelectValue placeholder="Selecione sua nacionalidade" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.iso2}
                                                value={country.name_en}
                                            >
                                                {country.name_pt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.nationality && (
                                    <p className="text-xs text-red-500">
                                        {fieldErrors.nationality}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium text-foreground"
                                    htmlFor="phone"
                                >
                                    Telefone *
                                </label>
                                <div className="grid grid-cols-[1fr_3fr] gap-2">
                                    <Select
                                        value={selectedCountryCode}
                                        onValueChange={setSelectedCountryCode}
                                    >
                                        <SelectTrigger className="h-10 border-foreground/20 bg-background-secondary">
                                            <SelectValue placeholder="+00">
                                                {selectedCountryCode &&
                                                    countryCodes.find(
                                                        (c) =>
                                                            c.cca2 ===
                                                            selectedCountryCode,
                                                    )?.callingCode}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryCodes.map((country) => (
                                                <SelectItem
                                                    key={country.cca2}
                                                    value={country.cca2}
                                                >
                                                    <div className="flex items-center justify-between w-full gap-3">
                                                        <span className="font-medium">
                                                            {
                                                                country.callingCode
                                                            }
                                                        </span>
                                                        <span className="text-foreground/60 text-xs">
                                                            {country.name_pt}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            placeholder={
                                                selectedCountryCode === "BR"
                                                    ? "(00) 00000-0000"
                                                    : "Número sem código do país"
                                            }
                                            className="w-full h-10 px-3 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                {fieldErrors.countryCode && (
                                    <p className="text-xs text-red-500">
                                        {fieldErrors.countryCode}
                                    </p>
                                )}
                                {fieldErrors.phone && (
                                    <p className="text-xs text-red-500">
                                        {fieldErrors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Idioma *
                                </label>
                                <Select
                                    value={selectedLang}
                                    onValueChange={setSelectedLang}
                                >
                                    <SelectTrigger className="w-full h-10 border-foreground/20 bg-background-secondary">
                                        <div className="flex items-center gap-2">
                                            <SelectValue placeholder="Selecione seu idioma" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((language) => (
                                            <SelectItem
                                                key={language.code}
                                                value={language.code}
                                            >
                                                {language.name_pt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.lang && (
                                    <p className="text-xs text-red-500">
                                        {fieldErrors.lang}
                                    </p>
                                )}
                            </div>

                            {isBrazilian && (
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-foreground"
                                        htmlFor="document"
                                    >
                                        CPF *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="document"
                                            value={document}
                                            onChange={handleCPFChange}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    {fieldErrors.document && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.document}
                                        </p>
                                    )}
                                </div>
                            )}

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
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
                                                setShowConfirmPassword(
                                                    (v) => !v,
                                                )
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

                        <p className="text-sm text-foreground/70">
                            Ao criar uma conta, você concorda com nossos{" "}
                            <Link
                                href="/termos"
                                className="underline text-primary"
                            >
                                Termos de Serviço
                            </Link>
                            . Ocasionalmente, enviaremos emails com atualizações
                            importantes ou ofertas especiais.
                        </p>

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
            </div>
        </main>
    );
}
