"use server";
import axios from "axios";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getGamesData(
    filters: GamesFilters = {}
): Promise<GamesResponse | null> {
    const session = await getSession();

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

        const { data } = await axios.get(
            `https://api.testeplayfiver.com/api/panel/games?${params.toString()}`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data as GamesResponse;
    } catch (error) {
        console.error("Failed to fetch games data:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogos")
        );
    }
}
