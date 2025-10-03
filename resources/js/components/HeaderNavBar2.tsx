import ThemeToggle from '@/components/theme-toggle';
import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export default function HeaderNavBar2() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {auth?.user ? (
                    <Link
                        href={dashboard()}
                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link href={home()} className="flex items-center gap-3 font-medium">
                            <img
                                src="../../../../imagenes/logo Arbol.png"
                                alt="Mi Logo"
                                className="h-14 w-auto transition-opacity duration-200 hover:opacity-50"
                            />
                            <span className="text-2xl font-semibold text-emerald-800 dark:text-amber-100">Family Roots</span>
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
    );
}
