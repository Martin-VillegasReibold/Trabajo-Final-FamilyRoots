import Footer2 from '@/components/Footer2';
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
                                        Sobre FamilyRoots
                                    </h1>
                                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                                        <strong>FamilyRoots</strong> es una plataforma digital creada por un equipo apasionado por la genealogía y la tecnología, dedicada a ayudar a las personas a descubrir, preservar y compartir su historia familiar de manera sencilla, segura y colaborativa.
                                    </p>

                                    <section className="mt-6">
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            ¿Quiénes somos?
                                        </h2>
                                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                                            Somos un grupo de desarrolladores y entusiastas de la genealogía comprometidos con la misión de conectar familias y preservar la memoria de generaciones. Creemos que cada historia familiar merece ser contada y compartida.
                                        </p>
                                    </section>

                                    <section className="mt-6">
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Nuestro objetivo
                                        </h2>
                                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                                            Brindar una herramienta intuitiva y segura para que cualquier persona pueda construir su árbol genealógico, colaborar con familiares, almacenar recuerdos y fortalecer los lazos familiares a través de la tecnología.
                                        </p>
                                    </section>

                                    <section className="mt-6">
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Funcionalidades de FamilyRoots
                                        </h2>
                                        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
                                            <li>Creación y edición de árboles genealógicos visuales e interactivos.</li>
                                            <li>Invitación y colaboración con familiares y amigos en tiempo real.</li>
                                            <li>Gestión de perfiles familiares con información detallada y fotos.</li>
                                            <li>Almacenamiento seguro de imágenes y documentos familiares.</li>
                                            <li>Comentarios y notas en nodos del árbol para compartir historias y anécdotas.</li>
                                            <li>Quiz familiar para aprender y poner a prueba el conocimiento sobre la familia.</li>
                                            <li>Calendario de eventos familiares y recordatorios importantes.</li>
                                            <li>Herramientas de búsqueda y filtrado para encontrar rápidamente personas o ramas.</li>
                                            <li>Exportación de árboles en formato imagen para compartir o imprimir.</li>
                                            <li>Interfaz moderna, accesible y adaptable a dispositivos móviles.</li>
                                        </ul>
                                    </section>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
                <Footer2 />
            </div>
        </>
    );
}
