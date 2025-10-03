import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useRef } from 'react';

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

    // Search functionality
    const handleSearch = useRef(
        debounce((query: string) => {
            router.get(
                '/arboles',
                { search: query },
                { preserveState: true, replace: true },
            );
        }),
    ).current;

    // serach method
    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const query = e.target.value;
        handleSearch(query);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Árboles" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Mis Árboles</h1>

                <div>
                    <input
                        type="text"
                        placeholder="Buscar árbol..."
                        className="mb-4 w-full rounded border p-2"
                        onChange={onSearchChange}
                        id={'search'}
                    />
                </div>

                {arboles && arboles.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {arboles.map((a) => (
                            <Link
                                key={a.id}
                                href={`/espacio-trabajo/${a.id}`}
                                className="block rounded border p-4 hover:shadow-md"
                            >
                                <h2 className="text-lg font-semibold">
                                    {' '}
                                    {a.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    ID: {a.id}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded border bg-gray-800 p-8 text-center">
                        <p className="mb-2">No tenés árboles todavía.</p>
                        <Link href={crearArbol()} className="text-sky-600">
                            Crear uno ahora
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
