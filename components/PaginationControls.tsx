"use client";
import { useRouter, useSearchParams } from "next/navigation";
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
    const router = useRouter();
    const searchParamsHook = useSearchParams();

    const updatePage = (newPage: number) => {
        const params = new URLSearchParams(searchParamsHook.toString());
        params.set(paramKey, newPage.toString());
        router.push(`${baseUrl}?${params.toString()}`);
    };

    const goToPreviousPage = () => {
        if (hasPrevPage) {
            updatePage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (hasNextPage) {
            updatePage(currentPage + 1);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= lastPage && page !== currentPage) {
            updatePage(page);
        }
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
                    onClick={goToPreviousPage}
                    disabled={!hasPrevPage}
                    className="p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <CaretLeftIcon size={16} />
                </Button>

                <span className="text-sm text-foreground/70">
                    {currentPage} / {lastPage}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className="p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <CaretRightIcon size={16} />
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
                onClick={goToPreviousPage}
                disabled={!hasPrevPage}
                className="flex items-center gap-1 cursor-pointer"
            >
                <CaretLeftIcon size={16} />
                Anterior
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
                            key={pageNumber}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNumber)}
                            className={`min-w-[40px] ${
                                isCurrentPage
                                    ? "bg-primary text-primary-foreground"
                                    : "cursor-pointer"
                            }`}
                        >
                            {pageNumber}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-1 cursor-pointer"
            >
                Próxima
                <CaretRightIcon size={16} />
            </Button>
        </div>
    );
}
