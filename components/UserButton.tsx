"use client";
import React, { useState, useRef, useEffect } from "react";

import { useSession } from "@/contexts/SessionContext";
import {
    SignOutIcon,
    UserCircleIcon,
    CaretDownIcon,
} from "@phosphor-icons/react";
import { logout } from "@/lib/auth";
import Link from "next/link";

const UserButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, loading } = useSession();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!mounted || loading) {
        return (
            <div className="relative" ref={containerRef}>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex flex-col">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="sm:hidden flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="hidden sm:flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary/20 transition-colors cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.name ? getUserInitials(user.name) : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                    <h6 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name}
                    </h6>
                    <p className="text-sm  capitalize">{user?.role}</p>
                </div>
                <CaretDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>

            <div
                className="sm:hidden flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                    {user?.name ? getUserInitials(user.name) : "U"}
                </div>
                <h6 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {user?.name}
                </h6>
                <CaretDownIcon
                    className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-background-secondary rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b ">
                        <p className="text-sm font-medium ">{user?.name}</p>
                        <p className="text-xs text-foreground/50 capitalize">
                            {user?.role}
                        </p>
                    </div>

                    <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3  group"
                        onClick={() => setIsOpen(false)}
                    >
                        <UserCircleIcon className="w-5 h-5 " />
                        <span className="text-sm font-medium">Perfil</span>
                    </Link>

                    <div
                        onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3  group cursor-pointer"
                    >
                        <SignOutIcon className="w-5 h-5 " />
                        <span className="text-sm font-medium">Sair</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserButton;
