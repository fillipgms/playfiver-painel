import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import { StarIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";

import PlayersTable from "@/components/tables/PlayersTable";
import { Metadata } from "next";
import { getPlayersData } from "@/actions/players";
import { Suspense } from "react";
import PaginationControls from "@/components/PaginationControls";

export const metadata: Metadata = {
    title: "Playfiver - Jogadores",
    description: "Jogadores do sistema",
};

interface JogadoresPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function JogadoresPage({
    searchParams,
}: JogadoresPageProps) {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const search = resolvedSearchParams.search || "";

    const res = await getPlayersData(page, search);
    const jogadores = res.data;

    return (
        <main className="space-y-8">
            <section
                id="jogadores-info"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0"
            >
                <Card main>
                    <CardHeader>
                        <Icon variant="secondary">
                            <UsersThreeIcon />
                        </Icon>
                        Jogadores
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">
                            {res.players > 0 ? res.players : 0}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Icon>
                            <UsersThreeIcon />
                        </Icon>
                        Online Agora
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">
                            {res.players_active > 0 ? res.players_active : 0}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Icon>
                            <StarIcon />
                        </Icon>
                        Influencers
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">
                            {res.players_influencers > 0
                                ? res.players_influencers
                                : 0}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Icon>
                            <UsersThreeIcon />
                        </Icon>
                        RPT Médio
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">
                            {Number(res.players_rtp) > 0
                                ? Number(res.players_rtp).toFixed(2)
                                : 0}
                            %
                        </span>
                    </CardContent>
                </Card>
            </section>

            <section>
                <PlayersTable players={jogadores} />
            </section>

            <Suspense fallback={<div>Carregando paginação...</div>}>
                <PaginationControls
                    currentPage={res.current_page}
                    lastPage={res.last_page}
                    hasNextPage={!!res.next_page_url}
                    hasPrevPage={!!res.prev_page_url}
                    baseUrl="/jogadores"
                    searchParams={resolvedSearchParams}
                />
            </Suspense>
        </main>
    );
}
