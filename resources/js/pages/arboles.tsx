import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { crearArbol } from '@/routes';

interface Arbol {
    id: number;
    name: string;
}

interface PageProps {
    arboles: Arbol[];
    [key: string]: unknown;
}

export default function Arboles() {
    const { arboles } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Árboles', href: '/arboles' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Árboles" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Mis Árboles</h1>

                {arboles && arboles.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" >
                        {arboles.map((a) => (
                            <Link key={a.id} href={`/espacio-trabajo/${a.id}`} className="block border rounded p-4 hover:shadow-md "  >
                                <h2 className="text-lg font-semibold"> {a.name}</h2>
                                <p className="text-sm text-gray-500">ID: {a.id}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 border rounded bg-gray-800">
                        <p className="mb-2">No tenés árboles todavía.</p>
                        <Link  href={crearArbol()} className="text-sky-600 ">
                            Crear uno ahora
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
