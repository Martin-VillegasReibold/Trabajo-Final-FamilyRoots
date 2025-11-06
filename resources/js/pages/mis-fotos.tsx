import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/components/FamilyTree/ConfirmModal';
import { Head, router as inertiaRouter } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import { Page } from '@inertiajs/core';

export type Foto = { id?: number; url: string; nombre: string };
export type MisFotosPageProps = {
    fotos?: { id?: number; url?: string; ruta?: string; nombre: string }[];
};

export default function MisFotos(props: MisFotosPageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Cargar fotos desde props si existen (Inertia)
    const initialFotos: Foto[] = props.fotos
        ? props.fotos.map((f) => ({ id: f.id, url: f.url ?? '', nombre: f.nombre }))
        : [
            { url: '/imagenes/ejemplo1.jpg', nombre: 'Ejemplo 1' },
            { url: '/imagenes/ejemplo2.jpg', nombre: 'Ejemplo 2' },
        ];
    const [fotos, setFotos] = useState<Foto[]>(initialFotos);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [nombreFoto, setNombreFoto] = useState('');
    const [showRename, setShowRename] = useState(false);
    const [fotoAEliminar, setFotoAEliminar] = useState<number|null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setPendingFile(files[0]);
            setNombreFoto(files[0].name.replace(/\.[^/.]+$/, ''));
            setShowRename(true);
        }
    };

    const handleConfirmNombre = () => {
        if (!pendingFile) return;
        setUploading(true);
        setUploadMsg(null);
        setShowRename(false);
        const formData = new FormData();
        formData.append('foto', pendingFile);
        formData.append('nombre', nombreFoto);
        inertiaRouter.post('/mis-fotos', formData, {
            forceFormData: true,
            onSuccess: (page: Page<{ fotos?: Foto[]; url?: string; nombre?: string }>) => {
                if (page.props.fotos && Array.isArray(page.props.fotos)) {
                    setFotos(page.props.fotos.map((f) => ({
                        id: f.id,
                        url: f.url ?? '',
                        nombre: f.nombre,
                    })));
                } else if (typeof page.props.url === 'string' && typeof page.props.nombre === 'string') {
                    setFotos((prev) => [
                        ...prev,
                        { url: page.props.url || '', nombre: page.props.nombre || '' },
                    ]);
                }
                setUploadMsg(`Foto subida: ${nombreFoto}`);
            },
            onError: () => {
                setUploadMsg('Error al subir la foto');
            },
            onFinish: () => {
                setUploading(false);
                setPendingFile(null);
                setNombreFoto('');
            },
        });
    };

    const handleCancelNombre = () => {
        setShowRename(false);
        setPendingFile(null);
        setNombreFoto('');
    };

    const handleDelete = (fotoId?: number) => {
        if (!fotoId) return;
        setFotoAEliminar(fotoId);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (!fotoAEliminar) return;
        inertiaRouter.delete(`/mis-fotos/${fotoAEliminar}`, {
            onSuccess: () => {
                setFotos((prev) => prev.filter((f) => f.id !== fotoAEliminar));
                setUploadMsg('Foto eliminada correctamente');
            },
            onError: () => {
                setUploadMsg('Error al eliminar la foto');
            },
            onFinish: () => {
                setFotoAEliminar(null);
                setShowConfirm(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mis Fotos', href: '/mis-fotos' }]}>
            <Head title="Mis Fotos" />
            <main
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto bg-slate-50 p-6 dark:bg-gray-900"
                aria-label="Galería de fotos"
            >
                <a
                    href="#galeria-fotos"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800 focus:z-50"
                >
                    Ir a la galería de fotos
                </a>
                <div className="flex flex-col gap-1 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 4MB.
                    </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Mis Fotos
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 transition cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Subir nueva foto"
                            disabled={uploading}
                        >
                            {uploading ? 'Subiendo...' : 'Subir nueva foto'}
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            aria-label="Seleccionar archivo de imagen"
                        />
                    </div>
                </div>
                {uploadMsg && (
                    <div
                        className="mb-2 text-green-700 bg-green-100 rounded px-3 py-2 text-sm"
                        role="status"
                    >
                        {uploadMsg}
                    </div>
                )}
                <section
                    className="grid auto-rows-min gap-6 md:grid-cols-8"
                    id="galeria-fotos"
                    aria-label="Tus fotos"
                    role="list"
                >
                    {fotos.length === 0 && (
                        <span
                            className="text-gray-400 col-span-3 text-center"
                            role="status"
                        >
                            No tienes fotos guardadas.
                        </span>
                    )}
                    {fotos.map((foto, idx) => (
                        <div key={foto.id ?? idx} className="flex flex-col items-center">
                            <div
                                tabIndex={0}
                                role="listitem"
                                aria-label={`Foto ${idx + 1}: ${foto.nombre}`}
                                className="relative flex flex-col items-center justify-center aspect-video overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-200 focus-within:ring-offset-2 transition-all duration-200 dark:bg-gray-800 group outline-none w-full"
                            >
                                <img
                                    src={foto.url}
                                    alt={foto.nombre}
                                    className="object-contain max-h-[90px] max-w-[140px] rounded mb-2 transition group-focus:ring-2 group-focus:ring-emerald-400"
                                    draggable={false}
                                />
                                {foto.id && (
                                    <button
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                                        title="Eliminar foto"
                                        onClick={() => handleDelete(foto.id)}
                                    >
                                        <span className="sr-only">Eliminar foto</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1 truncate w-full text-center px-2">
                                {foto.nombre}
                            </span>
                        </div>
                    ))}
                </section>
                {/* Modal para renombrar foto */}
                {showRename && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Nombrar foto
                            </h2>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                value={nombreFoto}
                                onChange={e => setNombreFoto(e.target.value)}
                                autoFocus
                                aria-label="Nombre de la foto"
                                maxLength={40}
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                                    onClick={handleCancelNombre}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                                    onClick={handleConfirmNombre}
                                    disabled={!nombreFoto.trim() || uploading}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <ConfirmModal
                    open={showConfirm}
                    title="Eliminar foto"
                    description="¿Seguro que deseas borrar esta foto? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onCancel={() => { setShowConfirm(false); setFotoAEliminar(null); }}
                />
            </main>
        </AppLayout>
    );
}
