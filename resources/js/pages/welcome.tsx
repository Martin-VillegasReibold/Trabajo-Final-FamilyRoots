import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';


export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" >
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 lg:justify-center lg:p-8 dark:bg-[#065a9a]">
                <header className="w-full dark:bg-[#aae4b3fe] fixed top-0 left-0 z-50 shadow-sm">
                    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                                    <img src="../../../../imagenes/logo Arbol.png" alt="Mi Logo" className='h-20 w-auto hover:opacity-50 transition-opacity duration-200' />
                                </Link>
                                <div className="flex items-center gap-4">
                                    <Link href={login()} className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                                        Iniciar sesión
                                    </Link>
                                    <Link href={register()} className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                                        Registrarse
                                    </Link>
                                    <Link href="/about" className="inline-block rounded-sm bg-[#53a460fe] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:bg-[#229a36fe] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#ffffff] dark:hover:border-[#248233fe]">
                                        Sobre nosotros
                                    </Link>
                                </div>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    HOAL MUNDO
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
