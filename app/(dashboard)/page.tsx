import { getHomeData } from "@/actions/home";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import LineGraph from "@/components/LineGraph";
import {
    EyeIcon,
    GpsFixIcon,
    HandArrowUpIcon,
    UsersThreeIcon,
} from "@phosphor-icons/react/ssr";

export default async function Home() {
    const {
        user_count,
        agent_count,
        active_players,
        games_views,
        provedores_views,
    } = (await getHomeData()) as HomeResponse;

    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            <Card main className="col-span-1 sm:col-span-1 lg:col-span-2">
                <CardHeader>
                    <Icon variant="secondary">
                        <UsersThreeIcon />
                    </Icon>
                    Jogadores
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{user_count}</span>
                </CardContent>
            </Card>

            <Card className="col-span-1 sm:col-span-1 lg:col-span-2">
                <CardHeader>
                    <Icon>
                        <GpsFixIcon />
                    </Icon>
                    Agentes
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{agent_count}</span>
                </CardContent>
            </Card>

            <Card className="col-span-1 sm:col-span-1 lg:col-span-2">
                <CardHeader>
                    <Icon>
                        <UsersThreeIcon />
                    </Icon>
                    Jogadores Ativos
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{active_players}</span>
                </CardContent>
            </Card>

            <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
                <CardHeader>
                    <Icon>
                        <EyeIcon />
                    </Icon>
                    <span className="text-lg sm:text-xl font-bold">
                        Principais Jogos
                    </span>
                </CardHeader>
                <CardContent>
                    <LineGraph data={games_views} />
                </CardContent>
            </Card>

            <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
                <CardHeader>
                    <Icon>
                        <HandArrowUpIcon />
                    </Icon>
                    <span className="text-lg sm:text-xl font-bold">
                        Principais Provedores
                    </span>
                </CardHeader>
                <CardContent>
                    <ul className="flex flex-col gap-3">
                        {provedores_views.map((provider) => {
                            const max = Math.max(
                                ...provedores_views.map((p) => p.count)
                            );
                            const percent = (provider.count / max) * 100;

                            return (
                                <li
                                    key={provider.game_name}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 w-full"
                                >
                                    <span className="text-xs sm:text-sm font-medium min-w-0 flex-shrink-0">
                                        {provider.game_name}
                                    </span>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 justify-end flex h-2">
                                            <div
                                                className="h-full rounded-full justify-end bg-primary transition-all duration-300"
                                                style={{
                                                    width: `${percent}%`,
                                                    minWidth:
                                                        provider.count > 0
                                                            ? "2px"
                                                            : "0px",
                                                }}
                                            />
                                        </div>
                                        <span className="whitespace-nowrap text-xs text-muted-foreground min-w-[30px] text-right">
                                            {provider.count} visualizações
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </CardContent>
            </Card>
        </main>
    );
}
