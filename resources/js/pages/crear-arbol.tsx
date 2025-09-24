import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { Head, useForm} from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [ { 
    title: 'Crear Árbol', 
    href: crearArbol().url, }, ];


export default function CreateTree() {
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
                <form onSubmit={submit} className="space-y-4">
                    <input type="text" placeholder="Nombre del árbol" value={data.name} onChange={(e) => setData('name', e.target.value)} className="border p-2 rounded w-full"/>
                    {errors.name && (
                        <div className="text-red-500">{errors.name}</div>
                    )}
                    <button type="submit" disabled={processing} className="bg-sky-500 hover:bg-sky-800 text-white p-2 rounded-md">
                        Crear
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
