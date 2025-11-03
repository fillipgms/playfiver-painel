"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { unstable_cache } from "next/cache";

const fetchGamesCached = unstable_cache(
    async (accessToken: string, queryString: string) => {
        const { data } = await axios.get(
            `https://api.testeplayfiver.com/api/panel/games?${queryString}`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (!data) throw new Error("No valid data received from API");
        return data as GamesResponse;
    },
    ["games-data"],
    { revalidate: 120 }
);

export async function getGamesData(
    filters: GamesFilters = {}
): Promise<GamesResponse | null> {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.search) params.append("search", filters.search);

        if (filters.provedor && filters.provedor.length > 0) {
            params.set("provedor", `[${filters.provedor.join(",")}]`);
        }

        if (filters.typeGame && filters.typeGame.length > 0) {
            params.set("typeGame", `[${filters.typeGame.join(",")}]`);
        }

        if (filters.bonus !== undefined)
            params.append("bonus", filters.bonus.toString());

        const queryString = params.toString();
        return await fetchGamesCached(session?.accessToken ?? "", queryString);
    } catch (error) {
        console.error("Failed to fetch games data:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogos")
        );
    }
}
