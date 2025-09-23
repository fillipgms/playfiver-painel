import { getIpWhitelist } from "@/actions/ipWhitelist";
import PaginationControls from "@/components/PaginationControls";
import IpWhitelistClient from "@/components/IpWhitelistClient";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "IP Whitelist",
    description: "IP Whitelist do sistema",
};

interface IpWhitelistPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function IpWhitelistPage({
    searchParams,
}: IpWhitelistPageProps) {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const search = resolvedSearchParams.search || "";

    const res = await getIpWhitelist(page, search);
    const whitelist = res.data;

    return (
        <main>
            <IpWhitelistClient whitelist={whitelist} />

            <Suspense fallback={<div>Carregando paginação...</div>}>
                <PaginationControls
                    currentPage={res.current_page}
                    lastPage={res.last_page}
                    hasNextPage={!!res.next_page_url}
                    hasPrevPage={!!res.prev_page_url}
                    baseUrl="/ipwhitelist"
                    searchParams={resolvedSearchParams}
                />
            </Suspense>
        </main>
    );
}
