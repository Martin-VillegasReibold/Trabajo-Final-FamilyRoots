import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, useForm, usePage} from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [ { 
    title: 'Espacio de trabajo', 
    href: crearArbol().url, }, ];

interface PageProps extends InertiaPageProps {
    arbol: { id: number; name: string; user_id: number } | null;
}

export default function CreateTree() {
    const { arbol } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/crear-arbol');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Árbol" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Crear Árbol</h1>

                {arbol ? (
                    //Si ya existe un arbol mostramos el espacio de trabajo con el arbol
                    <div className="p-10 border rounded bg-green-600 text-center">
                        <p> Árbol: {arbol.name}</p>
                    </div>
                ) : (
                    //Si no existe mostramos el formulario
                    <form onSubmit={submit} className="space-y-4">
                        <input type="text" placeholder="Nombre del árbol" value={data.name} onChange={(e) => setData('name', e.target.value)} className="border p-2 rounded w-full"/>
                        {errors.name && (
                            <div className="text-red-500">{errors.name}</div>
                        )}
                        <button type="submit" disabled={processing} className="bg-sky-500 hover:bg-sky-800 text-white p-2 rounded-md">
                            Crear
                        </button>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
