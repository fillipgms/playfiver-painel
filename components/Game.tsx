"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { LockKeyIcon, SealCheckIcon } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

const Badge = ({
    active,
    children,
}: {
    active: boolean;
    children: React.ReactNode;
}) => (
    <div
        className={twMerge(
            "py-0.5 px-2 rounded text-sm",
            active
                ? "bg-primary text-background-primary"
                : "bg-background-secondary text-foreground opacity-50 line-through"
        )}
    >
        {children}
    </div>
);
const Game = ({
    game,
    id,
    isPinnedForced,
}: {
    game: GameProps;
    id: string;
    isPinnedForced?: boolean;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [alignRight, setAlignRight] = useState(false);
    const [verticalAlign, setVerticalAlign] = useState<"top" | "bottom" | null>(
        null
    );
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        const checkPosition = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();

                if (window.innerWidth <= 768) {
                    const hasSpaceBottom =
                        rect.bottom + 260 < window.innerHeight;
                    setVerticalAlign(hasSpaceBottom ? "bottom" : "top");
                    setAlignRight(false);
                } else {
                    setVerticalAlign(null);
                    const hasSpaceRight = rect.right + 260 < window.innerWidth;
                    setAlignRight(!hasSpaceRight);
                }
            }
        };

        checkPosition();
        window.addEventListener("resize", checkPosition);
        return () => window.removeEventListener("resize", checkPosition);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsPinned(false);
            }
        };
        if (isPinned && !isPinnedForced) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isPinned, isPinnedForced]);

    return (
        <div
            id={id}
            className="relative group"
            ref={containerRef}
            onClick={() => setIsPinned((prev) => !prev)}
        >
            <div className="transition cursor-pointer group-hover:scale-105">
                {game.blocked && (
                    <div className="absolute rounded-md top-0 left-0 flex items-center justify-center bg-black/50 h-full w-full">
                        <LockKeyIcon weight="fill" className="text-4xl" />
                    </div>
                )}
                <Image
                    src={game.image_url}
                    alt={game.name}
                    height={350}
                    width={300}
                    className="rounded-md"
                />
            </div>

            <div
                id={`info-${id}`}
                className={`absolute w-60 z-20 p-4 rounded-md bg-background-primary space-y-2
          ${
              verticalAlign
                  ? verticalAlign === "bottom"
                      ? "top-[110%] left-1/2 -translate-x-1/2"
                      : "bottom-[110%] left-1/2 -translate-x-1/2"
                  : alignRight
                  ? "right-[110%] top-1/2 -translate-y-1/2"
                  : "left-[110%] top-1/2 -translate-y-1/2"
          }
          ${
              isPinned || isPinnedForced
                  ? "block pointer-events-auto"
                  : "hidden group-hover:block pointer-events-none"
          }
        `}
            >
                <div>
                    <p className="text-foreground/50 text-xs">
                        Código: {game.game_code}
                    </p>
                </div>

                <div className="text-wrap">
                    <span>{game.name}</span>
                    {game.original === 1 && (
                        <SealCheckIcon
                            className="text-primary inline-block align-baseline ml-1"
                            weight="fill"
                        />
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge active={game.original === 1}>Original</Badge>
                    <div className="bg-background-secondary text-sm text-foreground py-0.5 px-2 rounded">
                        {game.provedor}
                    </div>
                    <Badge active={game.rodadasfree === 1}>
                        Rodadas Grátis
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default Game;
