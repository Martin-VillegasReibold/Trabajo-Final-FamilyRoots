import ThemeToggle from '@/components/theme-toggle';
import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useRef, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    // Si el controlador no pasó `arboles`, evitar error usando valor por defecto
    const { arboles } = usePage<PageProps>().props;

    interface Arbol {
        id: number;
        name: string;
        user?: {
            id?: number;
            name?: string;
        } | null;
    }

    interface PageProps {
        arboles: Arbol[];
        [key: string]: unknown;
    }

    // Search functionality
    // Usamos 300ms de debounce para no hacer demasiadas requests.
    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(
                home(),
                { search: query },
                { preserveState: true, replace: true },
            );
        }, 300),
    ).current;

    // search method: guardamos el texto localmente para poder mostrar
    // un botón de limpiar y mantener el valor controlado.
    const [query, setQuery] = useState('');

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setQuery(value);
        handleSearch(value);
    }

    function clearSearch() {
        setQuery('');
        handleSearch('');
    }

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-slate-50 p-6 lg:justify-center lg:p-8 dark:bg-gray-900">
                {/* Skip link for keyboard users */}
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800"
                >
                    Ir al contenido
                </a>

                <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
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
                            {/* Buscador sticky: aparece pegado debajo del header y no cambia de posición */}
                            <div className="sticky top-16 z-40 -mx-6 px-6">
                                <div className="py-3">
                                    {/* transparente: sin rectángulo blanco detrás del buscador */}
                                    <div className="mx-auto max-w-7xl">
                                        <div className="mb-0 flex items-center gap-3">
                                            <div
                                                role="search"
                                                aria-label="Buscar árboles"
                                                className="relative flex w-full items-center"
                                            >
                                                {/* Visually hidden label for screen readers */}
                                                <label
                                                    htmlFor="buscar"
                                                    className="sr-only"
                                                >
                                                    Buscar árboles por nombre
                                                </label>
                                                {/* Icono de lupa */}
                                                <div
                                                    className="pointer-events-none absolute left-3 text-gray-400"
                                                    aria-hidden
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="buscar"
                                                    id="buscar"
                                                    value={query}
                                                    onChange={onSearchChange}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            // ejecutar búsqueda inmediata al presionar Enter
                                                            router.get(
                                                                home(),
                                                                {
                                                                    search: query,
                                                                },
                                                                {
                                                                    preserveState: true,
                                                                    replace: true,
                                                                },
                                                            );
                                                        }
                                                        if (
                                                            e.key === 'Escape'
                                                        ) {
                                                            clearSearch();
                                                        }
                                                    }}
                                                    placeholder="Buscar por nombre"
                                                    aria-label="Buscar árboles por nombre"
                                                    aria-controls="resultados-list"
                                                    className="w-full rounded-l-md border border-gray-300 px-12 py-3 text-base placeholder-gray-500 shadow-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                                                />

                                                {/* Botón buscar */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSearch(query)
                                                    }
                                                    className="-ml-px inline-flex items-center rounded-r-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                                                    aria-label="Buscar"
                                                >
                                                    Buscar
                                                </button>

                                                {/* Botón limpiar visible solo si hay texto */}
                                                {query.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={clearSearch}
                                                        className="absolute right-20 inline-flex items-center justify-center rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                                                        aria-label="Limpiar búsqueda"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                id="resultados-list"
                                className="mt-4 min-h-[18rem]"
                                role="region"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                <div className="mb-3 text-sm text-gray-600">
                                    {arboles.length} resultado
                                    {arboles.length !== 1 ? 's' : ''}
                                </div>
                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {arboles.map((a) => (
                                        <Link
                                            key={a.id}
                                            href={`/espacio-trabajo/${a.id}`}
                                            className="block rounded-lg border bg-white p-5 hover:shadow-lg focus:ring-2 focus:ring-emerald-200 focus:outline-none dark:bg-gray-800"
                                            role="article"
                                            aria-labelledby={`arbol-${a.id}-title`}
                                        >
                                            <h2
                                                id={`arbol-${a.id}-title`}
                                                className="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
                                            >
                                                {a.name}
                                            </h2>
                                            <p className="text-base text-gray-700 dark:text-gray-300">
                                                ID: {a.id}
                                            </p>
                                            <p className="text-base text-gray-700 dark:text-gray-300">
                                                Creado por:{' '}
                                                {a.user?.name ?? 'Desconocido'}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                                {arboles.length === 0 && (
                                    <div className="mt-6 text-base text-gray-700">
                                        No se encontraron resultados.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
