"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-xl font-semibold mb-2">
                    Ops! Algo deu errado
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Tente novamente ou volte para a página inicial.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 rounded bg-foreground text-background hover:opacity-80 transition"
                    >
                        Tentar novamente
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 rounded border border-foreground/30 hover:bg-foreground/10 transition"
                    >
                        Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
