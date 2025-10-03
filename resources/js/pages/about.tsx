import HeaderNavBar2 from '@/components/HeaderNavBar2';
import { Head } from '@inertiajs/react';

export default function About() {
    // HeaderNavBar2 obtiene auth internamente

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

                <HeaderNavBar2 />

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
