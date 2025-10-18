import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { activities } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Actividades',
        href: activities().url,
    },
];

export default function Activities() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Actividades"/>
            <main className="flex h-full flex-1 flex-col gap-6 overflow-x-auto bg-slate-50 p-6 dark:bg-gray-900">
                {/* Skip link for keyboard users */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800 focus:z-50"
                >
                    Ir al contenido principal
                </a>
                
                <div className="grid auto-rows-min gap-6 md:grid-cols-3" id="main-content">
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 dark:bg-gray-800" tabIndex={0} role="region" aria-label="Panel de estadísticas 1">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 dark:bg-gray-800" tabIndex={0} role="region" aria-label="Panel de estadísticas 2">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 dark:bg-gray-800" tabIndex={0} role="region" aria-label="Panel de estadísticas 3">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                    </div>
                </div>
                <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 md:min-h-min dark:bg-gray-800" tabIndex={0} role="region" aria-label="Panel principal del dashboard">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-600/20 dark:stroke-emerald-400/20" aria-hidden="true" />
                </div>
            </main>
        </AppLayout>
    );
}
