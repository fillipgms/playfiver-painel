"use client";

import React, { useEffect, useState } from "react";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "./ui/Credeza";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useSession } from "@/contexts/SessionContext";
import { registerOptions, updateUserData } from "@/actions/meta";
import Button from "./Button";
import {
    GlobeIcon,
    IdentificationCard,
    Phone,
    Translate,
} from "@phosphor-icons/react/dist/ssr";

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

const UpdateInfoModal = () => {
    const [open, setOpen] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedNationality, setSelectedNationality] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedLang, setSelectedLang] = useState("");
    const [phone, setPhone] = useState("");
    const [document, setDocument] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, refreshSession } = useSession();

    useEffect(() => {
        if (!user) return;

        if (user.data_update === true || !user.lang) {
            setOpen(true);
        }

        const getRegisterOptions = async () => {
            try {
                const res = await registerOptions();
                setCountries(res.countries || []);
                setLanguages(res.languages || []);
            } catch (err) {
                console.error(err);
                setError("Falha ao carregar opções");
            }
        };

        getRegisterOptions();
    }, [user]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const errors: Record<string, string> = {};

            if (!selectedNationality) errors.nationality = "Nacionalidade é obrigatória";
            if (!selectedCountry) errors.country = "País é obrigatório";
            if (!phone) errors.phone = "Telefone é obrigatório";
            if (!selectedLang) errors.lang = "Idioma é obrigatório";
            if (selectedNationality === "Brazil" && !document) {
                errors.document = "CPF é obrigatório";
            }

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                setIsSubmitting(false);
                return;
            }

            await updateUserData({
                nationality: selectedNationality,
                country: selectedCountry,
                phone,
                lang: selectedLang.toUpperCase(),
                ...(document && { document }),
            });

            await refreshSession();
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocorreu um erro ao atualizar informações"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    const isBrazilian = selectedNationality === "Brazil";

    return (
        <Credenza open={open}>
            <CredenzaTrigger className="sr-only">
                Abrir Atualizar
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary [&>button]:hidden max-w-md">
                <CredenzaHeader>
                    <CredenzaTitle className="text-xl text-center">
                        Complete seu perfil
                    </CredenzaTitle>
                    <p className="text-sm text-center text-foreground/60 mt-2">
                        Precisamos de algumas informações para continuar
                    </p>
                </CredenzaHeader>
                <CredenzaBody>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Nacionalidade *
                                </label>
                                <Select
                                    value={selectedNationality}
                                    onValueChange={setSelectedNationality}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full h-10 border-foreground/20 bg-background-secondary">
                                        <div className="flex items-center gap-2">
                                            <GlobeIcon className="w-4 h-4 text-foreground/40" />
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
                                <label className="text-sm font-medium text-foreground">
                                    País *
                                </label>
                                <Select
                                    value={selectedCountry}
                                    onValueChange={setSelectedCountry}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full h-10 border-foreground/20 bg-background-secondary">
                                        <div className="flex items-center gap-2">
                                            <GlobeIcon className="w-4 h-4 text-foreground/40" />
                                            <SelectValue placeholder="Selecione seu país" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.iso2}
                                                value={country.iso2}
                                            >
                                                {country.name_pt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.country && (
                                    <p className="text-xs text-red-500">
                                        {fieldErrors.country}
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
                                <div className="relative">
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isSubmitting}
                                        placeholder="Sem código do país"
                                        className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                </div>
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
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full h-10 border-foreground/20 bg-background-secondary">
                                        <div className="flex items-center gap-2">
                                            <Translate className="w-4 h-4 text-foreground/40" />
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
                                            onChange={(e) => setDocument(e.target.value)}
                                            disabled={isSubmitting}
                                            placeholder="000.000.000-00"
                                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <IdentificationCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                    </div>
                                    {fieldErrors.document && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.document}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Atualizando...
                                </div>
                            ) : (
                                "Continuar"
                            )}
                        </Button>
                    </form>
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
};

export default UpdateInfoModal;
