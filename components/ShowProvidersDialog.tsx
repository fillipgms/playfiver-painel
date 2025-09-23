"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import Button from "./Button";

import React from "react";

const ShowProvidersDialog = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    providers,
}: {
    providers: { name: string }[];
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">Mostrar Provedores</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl bg-background-primary max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Providers</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default ShowProvidersDialog;
