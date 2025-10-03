import ThemeToggle from '@/components/theme-toggle';
import { home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function About() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Sobre nosotros">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-slate-50 p-6 lg:justify-center lg:p-8 dark:bg-gray-900">
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800"
                >
                    Ir al contenido
                </a>

                <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        {auth?.user ? (
                            <Link
                                href={home()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={home()}
                                    className="flex items-center gap-3 font-medium"
                                >
                                    <img
                                        src="../../../../imagenes/logo Arbol.png"
                                        alt="Mi Logo"
                                        className="h-14 w-auto transition-opacity duration-200 hover:opacity-50"
                                    />
                                    <span className="text-2xl font-semibold text-emerald-800 dark:text-amber-100">
                                        Family Roots
                                    </span>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <ThemeToggle />
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-md bg-emerald-600 px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-md bg-emerald-600 px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        Registrarse
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="inline-block rounded-md bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200"
                                    >
                                        Sobre nosotros
                                    </Link>
                                </div>
                            </>
                        )}
                    </nav>
                </header>

                <div
                    id="main"
                    className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0"
                >
                    <div className="w-full">
                        <div className="mx-auto max-w-7xl px-6">
                            <main className="pt-24 pb-16">
                                <div className="rounded-lg bg-white/70 p-8 shadow-sm dark:bg-gray-800">
                                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                                        Sobre nosotros
                                    </h1>
                                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                                        Somos FamilyRoots, una plataforma para
                                        construir y compartir árboles
                                        genealógicos con familiares y
                                        colaboradores.
                                    </p>

                                    <section className="mt-6">
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Qué hacemos
                                        </h2>
                                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                                            Facilitamos la colaboración en
                                            árboles familiares, el
                                            almacenamiento seguro de información
                                            genealógica y herramientas para
                                            descubrir conexiones familiares.
                                        </p>
                                    </section>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
