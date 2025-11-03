import { getTransactionsData } from "@/actions/transactions";
import PaginationControls from "@/components/PaginationControls";
import TransactionsTable from "@/components/tables/TransactionsTable";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Transações",
    description: "Transações do sistema",
};

interface TransactionsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        dateStart?: string;
        dateEnd?: string;
        agent?: string;
    }>;
}

export default async function TransacoesPage({
    searchParams,
}: TransactionsPageProps) {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const search = resolvedSearchParams.search || "";
    const dateStart = resolvedSearchParams.dateStart || "";
    const dateEnd = resolvedSearchParams.dateEnd || "";
    const agent = resolvedSearchParams.agent || "";

    const res = await getTransactionsData(
        page,
        search,
        dateStart,
        dateEnd,
        agent
    );

    const transactions = res.data;

    return (
        <main>
            <TransactionsTable transactions={transactions} />

            <Suspense fallback={<div>Carregando paginação...</div>}>
                <PaginationControls
                    currentPage={res.current_page}
                    lastPage={res.last_page}
                    hasNextPage={!!res.next_page_url}
                    hasPrevPage={!!res.prev_page_url}
                    baseUrl="/transacoes"
                    searchParams={resolvedSearchParams}
                />
            </Suspense>
        </main>
    );
}
