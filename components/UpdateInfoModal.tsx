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

const UpdateInfoModal = () => {
    const [open, setOpen] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
    const [selectedNationality, setSelectedNationality] = useState("");
    const [selectedCountryCode, setSelectedCountryCode] = useState("");
    const [selectedLang, setSelectedLang] = useState("");
    const [phone, setPhone] = useState("");
    const [document, setDocument] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, refreshSession } = useSession();

    useEffect(() => {
        if (!user) return;

        const shouldOpenModal = user.data_update === true || !user.lang;

        if (shouldOpenModal) {
            const hasVisited = localStorage.getItem("playfiver-first-visit");
            const tourCompleted = localStorage.getItem(
                "playfiver-tour-completed",
            );

            if (!hasVisited && !tourCompleted) {
                const handleTourComplete = () => {
                    setOpen(true);
                };

                window.addEventListener("tourCompleted", handleTourComplete);

                return () => {
                    window.removeEventListener(
                        "tourCompleted",
                        handleTourComplete,
                    );
                };
            } else {
                setOpen(true);
            }
        }

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
    }, [user]);

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

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const errors: Record<string, string> = {};

            if (!selectedNationality)
                errors.nationality = "Nacionalidade é obrigatória";
            if (!selectedCountryCode)
                errors.countryCode = "Código do país é obrigatório";
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
                country: selectedCountryCode,
                phone: phone.replace(/\D/g, ""), // Send only numbers
                lang: selectedLang.toUpperCase(),
                ...(document && { document: document.replace(/\D/g, "") }), // Send only numbers
            });

            await refreshSession();
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocorreu um erro ao atualizar informações",
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
                                <label
                                    className="text-sm font-medium text-foreground"
                                    htmlFor="phone"
                                >
                                    Telefone *
                                </label>
                                <div className="flex gap-2">
                                    <Select
                                        value={selectedCountryCode}
                                        onValueChange={setSelectedCountryCode}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className="w-[180px] h-10 border-foreground/20 bg-background-secondary">
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
                                            disabled={isSubmitting}
                                            placeholder={
                                                selectedCountryCode === "BR"
                                                    ? "(00) 00000-0000"
                                                    : "Número sem código do país"
                                            }
                                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
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
                                            onChange={handleCPFChange}
                                            disabled={isSubmitting}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
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
