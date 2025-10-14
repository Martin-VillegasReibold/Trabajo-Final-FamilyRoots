import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useRef, useState } from 'react';
import BotonAccion from "@/components/ui/BotonAccion";
import { Inertia } from "@inertiajs/inertia";
import ModalConfirmacion from '@/components/ModalConfirmacion';
import ModalEditar from '@/components/ModalEditar';
import TreeOverview from '@/components/TreeOverview';

interface Arbol {
    id: number;
    name: string;
}

interface PageProps {
    arboles: Arbol[];
    [key: string]: unknown;
}

export default function Arboles() {
    const { arboles: arbolesIniciales } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArbolId, setSelectedArbolId] = useState<number | null>(null);
    const [arboles, setArboles] = useState<Arbol[]>(arbolesIniciales);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingArbol, setEditingArbol] = useState<Arbol | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Árboles', href: '/arboles' },
    ];

    const handleDelete = (id: number) => {
        setSelectedArbolId(id);
        setIsModalOpen(true);
    };

    const confirmarEliminacion = () => {
        if (selectedArbolId) {
            router.delete(`/arboles/${selectedArbolId}`, {
                onSuccess: () => {
                    setArboles(prev => prev.filter(a => a.id !== selectedArbolId));
                    setIsModalOpen(false);
                    setSelectedArbolId(null);
                },
            });
        }
    };

    // Funcion para abrir el modal de edicion
    const handleOpenEdit = (arbol: Arbol) => {
        setEditingArbol(arbol);
        setIsEditModalOpen(true);
    };

    // Funcion para guardar los cambios
    const handleSaveEdit = (nuevoNombre: string) => {
        if (editingArbol) {
            router.put(`/arboles/${editingArbol.id}`, {
                name: nuevoNombre
            }, {
                onSuccess: () => {
                    setArboles(prev =>
                        prev.map(a =>
                            a.id === editingArbol.id
                                ? { ...a, name: nuevoNombre }
                                : a
                        )
                    );
                }
            });
        }
    };

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
                            <div
                                key={a.id}
                                className="rounded border p-4 hover:shadow-md flex flex-col justify-between">
                                <Link href={`/espacio-trabajo/${a.id}`} className="block text-center">
                                    <TreeOverview arbolId={a.id} />
                                    <h2 className="text-lg font-semibold">{a.name}</h2>
                                </Link>

                                <div className="flex gap-4 justify-center mt-4">
                                    <BotonAccion text="Editar" variant="editar" onClick={() => handleOpenEdit(a)}/>
                                    <BotonAccion text="Eliminar" variant="eliminar" onClick={() => handleDelete(a.id)}/>
                                </div>
                            </div>

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
            <ModalConfirmacion
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmarEliminacion}
            />
            <ModalEditar
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
                nombreActual={editingArbol?.name || ''}
            />
        </AppLayout>
    );
}
