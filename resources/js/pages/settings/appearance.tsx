import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
//import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-emerald-100/50 md:p-8 dark:bg-gray-800/95 dark:border-gray-700/50">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Apariencia</h1>
                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                                Personaliza la apariencia de tu cuenta
                            </p>
                        </div>
                        <SettingsLayout>
                            <div className="space-y-6">
                                <AppearanceTabs />
                            </div>
                        </SettingsLayout>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
