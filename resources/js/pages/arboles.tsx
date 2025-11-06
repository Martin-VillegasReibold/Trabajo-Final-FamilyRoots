import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useRef, useState } from 'react';
import BotonAccion from "@/components/ui/BotonAccion";
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
    const { arboles } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArbolId, setSelectedArbolId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingArbol, setEditingArbol] = useState<Arbol | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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
                    setIsModalOpen(false);
                    setSelectedArbolId(null);
                },
                onError: (errors) => {
                    console.error('Error al eliminar:', errors);
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
                    setIsEditModalOpen(false);
                    setEditingArbol(null);
                },
                onError: (errors) => {
                    console.error('Error al editar:', errors);
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
        setSearchQuery(query);
        handleSearch(query);
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Árboles" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 overflow-hidden dark:from-gray-900 dark:to-gray-800">
                {/* Skip link for keyboard users */}
                <a
                    href="#arboles-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-emerald-800 focus:z-50 focus:shadow-lg"
                >
                    Ir al contenido de árboles
                </a>
                
                <div className="mx-auto max-w-7xl h-full flex flex-col" id="arboles-content">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Árboles</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Gestiona y explora tus árboles genealógicos familiares</p>
                    </div>

                    <div className="mb-6">
                        <form role="search" aria-label="Buscar árboles" className="max-w-md">
                            <label htmlFor="search-trees" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                                Buscar árboles
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="search-trees"
                                    type="text"
                                    placeholder="Buscar"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-base placeholder-gray-500 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    aria-describedby="search-help"
                                    aria-controls="arboles-list"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            handleSearch('');
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div id="search-help" className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                {searchQuery ? `Mostrando resultados para "${searchQuery}"` : 'Escribe para filtrar los árboles por nombre'}
                            </div>
                        </form>
                    </div>

                    {arboles && arboles.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {arboles.length} {arboles.length === 1 ? 'árbol encontrado' : 'árboles encontrados'}
                                </p>
                                <Link 
                                    href={crearArbol()} 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Nuevo Árbol
                                </Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" id="arboles-list" role="list" aria-label="Lista de árboles genealógicos">
                            {arboles.map((a) => (
                                <article
                                    key={a.id}
                                    className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 hover:shadow-lg hover:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:border-emerald-600"
                                    role="listitem"
                                >
                                    <Link 
                                        href={`/espacio-trabajo/${a.id}`} 
                                        className="block focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 rounded-lg cursor-pointer"
                                        aria-describedby={`tree-description-${a.id}`}
                                    >
                                        <div className="mb-4 transform group-hover:scale-[1.02] transition-transform duration-200" aria-hidden="true">
                                            <TreeOverview arbolId={a.id} />
                                        </div>
                                        <div className="text-center mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                                                {a.name}
                                            </h2>
                                            <p id={`tree-description-${a.id}`} className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                                                Árbol genealógico familiar
                                            </p>
                                        </div>
                                        <span className="sr-only">Abrir árbol genealógico {a.name}</span>
                                    </Link>

                                    <div className="flex gap-2 justify-center pt-4 border-t border-gray-100 dark:border-gray-700" id={`tree-actions-${a.id}`} role="group" aria-label={`Acciones para el árbol ${a.name}`}>
                                        <BotonAccion 
                                            text="Editar" 
                                            variant="editar" 
                                            onClick={() => handleOpenEdit(a)}
                                            aria-label={`Editar árbol ${a.name}`}
                                            className="cursor-pointer"
                                        />
                                        <BotonAccion 
                                            text="Eliminar" 
                                            variant="eliminar" 
                                            onClick={() => handleDelete(a.id)}
                                            aria-label={`Eliminar árbol ${a.name}`}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </article>
                            ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12" role="region" aria-label="Estado vacío">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-lg text-center max-w-md mx-auto dark:bg-gray-800/80 dark:border-gray-700/50">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" aria-hidden="true">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-white">¡Comenzá tu historia familiar!</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed dark:text-gray-300">Creá tu primer árbol genealógico y comenzá a documentar la historia de tu familia para las futuras generaciones.</p>
                                <Link 
                                    href={crearArbol()} 
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                                    aria-describedby="crear-primer-arbol-help"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Crear mi primer árbol
                                </Link>
                                <div id="crear-primer-arbol-help" className="text-xs text-gray-500 mt-3 dark:text-gray-400">
                                    Te llevará al formulario para crear tu árbol genealógico
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
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
