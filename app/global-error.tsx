"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
        <html>
            <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-2xl font-semibold mb-2">
                        Algo deu errado
                    </h1>
                    <p className="text-sm text-gray-300 mb-6">
                        Ocorreu um erro inesperado.{" "}
                        {error?.digest ? `(id: ${error.digest})` : ""}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 transition"
                        >
                            Tentar novamente
                        </button>
                        <Link
                            href="/"
                            className="px-4 py-2 rounded border border-white/30 hover:bg-white/10 transition"
                        >
                            Voltar para início
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
