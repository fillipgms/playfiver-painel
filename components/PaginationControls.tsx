"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PaginationControlsProps {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    baseUrl: string;
    searchParams: Record<string, string | string[] | undefined>;
    paramKey?: string;
    compact?: boolean;
    hideWhenSinglePage?: boolean;
}

export default function PaginationControls({
    currentPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
    baseUrl,
    paramKey = "page",
    compact = false,
    hideWhenSinglePage = true,
}: PaginationControlsProps) {
    const searchParamsHook = useSearchParams();

    const buildHref = (newPage: number) => {
        const params = new URLSearchParams(searchParamsHook.toString());
        params.set(paramKey, newPage.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    if (hideWhenSinglePage && lastPage <= 1) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage}
                    className="p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <Link
                        href={buildHref(currentPage - 1)}
                        aria-disabled={!hasPrevPage}
                        tabIndex={hasPrevPage ? 0 : -1}
                        onClick={(e) => {
                            if (!hasPrevPage) e.preventDefault();
                        }}
                    >
                        <CaretLeftIcon size={16} />
                    </Link>
                </Button>

                <span className="text-sm text-foreground/70">
                    {currentPage} / {lastPage}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage}
                    className="p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <Link
                        href={buildHref(currentPage + 1)}
                        aria-disabled={!hasNextPage}
                        tabIndex={hasNextPage ? 0 : -1}
                        onClick={(e) => {
                            if (!hasNextPage) e.preventDefault();
                        }}
                    >
                        <CaretRightIcon size={16} />
                    </Link>
                </Button>
            </div>
        );
    }

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(lastPage - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < lastPage - 1) {
            rangeWithDots.push("...", lastPage);
        } else if (lastPage > 1) {
            rangeWithDots.push(lastPage);
        }

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage}
                className="flex items-center gap-1 cursor-pointer"
            >
                <Link
                    href={buildHref(currentPage - 1)}
                    aria-disabled={!hasPrevPage}
                    tabIndex={hasPrevPage ? 0 : -1}
                    className="flex items-center gap-1"
                    onClick={(e) => {
                        if (!hasPrevPage) e.preventDefault();
                    }}
                >
                    <CaretLeftIcon size={16} />
                    Anterior
                </Link>
            </Button>

            <div className="flex items-center gap-1">
                {getVisiblePages().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="px-2 py-1 text-foreground/50"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isCurrentPage = pageNumber === currentPage;

                    return (
                        <Button
                            asChild
                            key={pageNumber}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            className={`min-w-[40px] ${
                                isCurrentPage
                                    ? "bg-primary text-primary-foreground"
                                    : "cursor-pointer"
                            }`}
                        >
                            <Link
                                href={buildHref(pageNumber)}
                                aria-current={
                                    isCurrentPage ? "page" : undefined
                                }
                                aria-disabled={isCurrentPage}
                                tabIndex={isCurrentPage ? -1 : 0}
                                onClick={(e) => {
                                    if (isCurrentPage) e.preventDefault();
                                }}
                            >
                                {pageNumber}
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                className="flex items-center gap-1 cursor-pointer"
            >
                <Link
                    href={buildHref(currentPage + 1)}
                    aria-disabled={!hasNextPage}
                    tabIndex={hasNextPage ? 0 : -1}
                    className="flex items-center gap-1"
                    onClick={(e) => {
                        if (!hasNextPage) e.preventDefault();
                    }}
                >
                    Próxima
                    <CaretRightIcon size={16} />
                </Link>
            </Button>
        </div>
    );
}
