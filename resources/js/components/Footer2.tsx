import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function Footer2() {
    const { auth } = usePage<SharedData>().props;

    return (
        <footer className="w-full mt-4 border-t border-gray-200 bg-white text-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:items-center">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <img src="/imagenes/logo Arbol.png" alt="Family Roots" className="h-7 w-auto" />
                            <span className="font-semibold text-emerald-800 dark:text-amber-100">Family Roots</span>
                        </div>
                        <p className="mt-1 max-w-sm text-gray-600 dark:text-gray-300">Construye la historia de tu familia en un solo lugar. Comparte recuerdos y preserva tu genealogía.</p>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Enlaces</h4>
                        <ul className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                            <li>
                                <Link href="/" className="text-emerald-700 hover:underline dark:text-emerald-400">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-700 hover:underline dark:text-gray-300">Sobre nosotros</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-700 hover:underline dark:text-gray-300">Blog</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Cuenta</h4>
                        <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                            {auth?.user ? (
                                <>
                                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                                    <Link href="/profile" className="hover:underline">Mi perfil</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:underline">Iniciar sesión</Link>
                                    <Link href="/register" className="hover:underline">Registrarse</Link>
                                </>
                            )}
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            {/* Small social icons */}
                            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M8 19c7.732 0 11.964-6.405 11.964-11.964 0-.182 0-.364-.013-.545A8.56 8.56 0 0 0 22 4.59a8.296 8.296 0 0 1-2.357.646 4.096 4.096 0 0 0 1.798-2.266 8.193 8.193 0 0 1-2.605.996A4.088 4.088 0 0 0 12.07 7.03c0 .321.036.634.106.935A11.6 11.6 0 0 1 3.15 3.65a4.07 4.07 0 0 0-.553 2.056c0 1.42.722 2.673 1.823 3.405a4.077 4.077 0 0 1-1.852-.512v.052c0 1.983 1.411 3.64 3.283 4.016a4.082 4.082 0 0 1-1.847.07c.521 1.625 2.033 2.808 3.827 2.842A8.205 8.205 0 0 1 2 17.335 11.59 11.59 0 0 0 8 19" />
                                </svg>
                            </a>
                            <a href="#" aria-label="GitHub" className="text-gray-500 hover:text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 .297a12 12 0 0 0-3.797 23.394c.6.113.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.419-1.304.762-1.605-2.665-.304-5.466-1.333-5.466-5.933 0-1.31.469-2.381 1.235-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.234 1.911 1.234 3.221 0 4.61-2.804 5.625-5.475 5.922.43.372.814 1.103.814 2.222v3.293c0 .32.216.694.825.576A12.005 12.005 0 0 0 12 .297" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 text-gray-600 dark:border-gray-800 dark:text-gray-400">
                    <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                        <div className="text-xs">© {new Date().getFullYear()} Family Roots. Todos los derechos reservados.</div>
                        <div className="flex gap-3 text-xs">
                            <a href="#" className="hover:underline">Privacidad</a>
                            <a href="#" className="hover:underline">Términos</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
