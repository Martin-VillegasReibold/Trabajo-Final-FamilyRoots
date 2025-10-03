import ThemeToggle from '@/components/theme-toggle';
import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function HeaderNavBar2() {
    const { auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // Close panel helper
    const closePanel = () => setOpen(false);

    // Focus management + keyboard trapping
    useEffect(() => {
        const panel = panelRef.current;
        if (open && panel) {
            // save previously focused element
            previouslyFocused.current = document.activeElement as HTMLElement;

            // lock body scroll on mobile
            document.body.style.overflow = 'hidden';

            // focus first focusable element inside panel
            const focusable = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            if (focusable.length) focusable[0].focus();

            // keydown handler for Escape and Tab trap
            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closePanel();
                }
                if (e.key === 'Tab') {
                    // simple trap: keep focus within panel
                    if (focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        (last as HTMLElement).focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        (first as HTMLElement).focus();
                    }
                }
            };

            document.addEventListener('keydown', onKeyDown);
            return () => {
                document.removeEventListener('keydown', onKeyDown);
                document.body.style.overflow = '';
                // restore focus
                if (previouslyFocused.current) previouslyFocused.current.focus();
            };
        }
        // cleanup if panel was not open
        return undefined;
    }, [open]);

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={home()} className="flex items-center gap-3 font-medium">
                            <img
                                src="../../../../imagenes/logo Arbol.png"
                                alt="Mi Logo"
                                className="h-10 w-auto transition-opacity duration-200 hover:opacity-80"
                            />
                            <span className="hidden text-xl font-semibold text-emerald-800 dark:text-amber-100 sm:inline-block">Family Roots</span>
                        </Link>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-4 sm:flex">
                        <ThemeToggle />
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-4 py-1 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="inline-block rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">Iniciar sesión</Link>
                                <Link href={register()} className="inline-block rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">Registrarse</Link>
                                <Link href="/about" className="inline-block rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-200">Sobre nosotros</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            type="button"
                            aria-label="Abrir menú"
                            aria-expanded={open}
                            onClick={() => setOpen(!open)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    {open ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                                <span className="text-sm font-medium">Menú</span>
                            </div>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile panel */}
            <div className={`sm:hidden ${open ? 'block' : 'hidden'} border-t border-gray-100 bg-white/95 dark:bg-gray-900/95 dark:border-gray-800`}>
                <div className="px-4 pt-4 pb-6">
                    <div className="flex flex-col gap-3">
                        <ThemeToggle />
                        {auth?.user ? (
                            <Link href={dashboard()} className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Dashboard</Link>
                        ) : (
                            <>
                                <Link href={login()} className="block rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Iniciar sesión</Link>
                                <Link href={register()} className="block rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Registrarse</Link>
                                <Link href="/about" className="block rounded-md px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">Sobre nosotros</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
