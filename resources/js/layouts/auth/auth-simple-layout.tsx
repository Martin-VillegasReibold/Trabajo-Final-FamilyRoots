import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 lg:p-8 dark:bg-gray-900">
            {/* Skip link for keyboard users */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800"
            >
                Ir al contenido
            </a>

            <div id="main" className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm md:p-8 dark:bg-gray-800">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <img src="../../../../imagenes/logo Arbol.png" alt="Mi Logo" className='h-20 w-auto hover:opacity-50 transition-opacity duration-200'/>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-extrabold text-gray-900 md:text-2xl dark:text-white">{title}</h1>
                                <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
