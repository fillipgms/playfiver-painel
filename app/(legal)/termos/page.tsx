"use client";

import termos from "@/data/termos.json";
import Link from "next/link";
import Image from "next/image";

import logo from "@/public/logo.png";

export default function Termos() {
    return (
        <main className="p-8 space-y-8">
            <div className="bg-background-secondary w-full sticky top-0  md:pr-4 md:py-4 z-30">
                <header className="bg-background-primary p-4 rounded-md flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                        <Image
                            src={logo.src}
                            height={logo.height}
                            width={logo.width}
                            alt="logo"
                            className="size-9"
                        />
                        <span className="font-black text-2xl text-primary">
                            Playfiver
                        </span>
                    </div>

                    <Link
                        className={
                            "inline-flex bg-primary text-background-primary items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 has-[>svg]:px-3"
                        }
                        href="/register"
                    >
                        Criar conta
                    </Link>
                </header>
            </div>

            <section className="space-y-4">
                <h1 className="text-4xl font-bold">{termos.title}</h1>

                <div>
                    <p className="text-xl">
                        última atualização: {termos.version}
                    </p>
                </div>
            </section>

            <section>
                <nav>
                    <ul className="space-y-2">
                        {termos.sections.map((section, i) => (
                            <li key={section.id} className="flex gap-1">
                                <span>{i}.</span>
                                <Link
                                    href={`#${section.id}`}
                                    className="underline text-primary flex gap-1 items-center"
                                >
                                    {section.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>

            <section className="space-y-4">
                <p>
                    Bem-vindo! A Playfiver conecta tecnologia e entretenimento
                    para oferecer uma experiência fluida, segura e inovadora em
                    jogos. Ficamos felizes em ter você por aqui.
                </p>
                <p>
                    Estes Termos de Uso explicam como nossa plataforma funciona
                    e quais são as responsabilidades de cada parte. Ao criar sua
                    conta ou usar nossos serviços, você concorda com as regras
                    descritas abaixo, elas garantem transparência e segurança
                    para todos.
                </p>
                <p>
                    Se tiver dúvidas, nosso time está disponível pelos canais
                    oficiais de suporte.
                </p>
            </section>

            {termos.sections.map((section) => (
                <section key={section.id} id={section.id} className="space-y-4">
                    <h2 className="font-bold text-2xl">{section.title}</h2>
                    <div className="space-y-2">
                        {section.content.map((data, i) => (
                            <p key={i}>{data}</p>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}
