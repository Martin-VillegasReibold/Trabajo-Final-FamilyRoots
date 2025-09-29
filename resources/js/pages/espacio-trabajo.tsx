import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Arbol {
    id: number;
    name: string;
}

interface PageProps {
    arbol: Arbol;
    [key: string]: unknown;
}

export default function EspacioTrabajo() {
    const { arbol } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Árboles', href: '/espacio-trabajo/' + arbol.id },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Espacio de trabajo - ${arbol.name}`} />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Espacio de trabajo: Arbol familia {arbol.name}
                </h1>
                <div className="p-10 border rounded bg-green-700 text-center">
                    aca podras construir tu arbol genealogico
                </div>
            </div>
        </AppLayout>
    );
}
