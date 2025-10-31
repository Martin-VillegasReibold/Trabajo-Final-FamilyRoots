import CommentSection from '@/components/CommentSection';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useCommentsStatus from '@/hooks/useCommentStatus';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import UserPhotosModal, { UserPhoto } from './UserPhotosModal';
import axios from 'axios';
import TagSelector from '../TagSelector';

interface FamilyMember {
    id?: number | string;
    key: number | string;
    name: string;
    gender?: 'M' | 'F' | 'Other';
    birthYear?: number;
    deathYear?: number;
    img?: string;
    spouses?: (number | string)[];
    parents?: (number | string)[];
    isMarriageNode?: boolean;
    spouseKeys?: (number | string)[];
}

interface InspectorProps {
    selected: FamilyMember | null;
    addRelationType: 'child' | 'spouse' | 'parent';
    setAddRelationType: (type: 'child' | 'spouse' | 'parent') => void;
    setShowAddModal: (show: boolean) => void;
    setShowDeleteModal: (show: boolean) => void;
    setSelected: (member: FamilyMember) => void;
    updateSelectedMember: (updates: Partial<FamilyMember>) => void;
    getAllRelationships: (
        member: FamilyMember,
    ) => Array<{ relationship: string; member: FamilyMember }>;
    refreshAllTags?: () => void;
}

export default function Inspector({
    selected,
    addRelationType,
    setAddRelationType,
    setShowAddModal,
    setShowDeleteModal,
    setSelected,
    updateSelectedMember,
    getAllRelationships,
    refreshAllTags,
}: InspectorProps) {
    const [activeTab, setActiveTab] = useState<'panel' | 'comments'>('panel');
    const { hasComments, setHasComments } = useCommentsStatus(selected?.id);

    // Estado para el modal de recordar
    // Estado para el modal de fotos de usuario
    const [showPhotosModal, setShowPhotosModal] = useState(false);
    const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);

    const openPhotosModal = async () => {
        setShowPhotosModal(true);
        setLoadingPhotos(true);
        try {
            const res = await axios.get('/api/mis-fotos');
            setUserPhotos(res.data.fotos || []);
        } catch (e) {
            setUserPhotos([]);
        } finally {
            setLoadingPhotos(false);
        }
    };
    const [rememberType, setRememberType] = useState<'birth' | 'death' | null>(
        null,
    );
    const [rememberDay, setRememberDay] = useState('');
    const [rememberMonth, setRememberMonth] = useState('');
    const [isRememberOpen, setIsRememberOpen] = useState(false);

    const openRememberModal = (type: 'birth' | 'death') => {
        setRememberType(type);
        setIsRememberOpen(true);
    };

    const handleRememberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected || !rememberType) return;
        if (!rememberDay || !rememberMonth) return alert('Completa día y mes');
        const title = `${rememberType === 'birth' ? 'Nacimiento' : 'Fallecimiento'} de ${selected.name}`;
        const color = rememberType === 'birth' ? '#10b981' : '#ef4444';
        const now = new Date();
        const currentYear = now.getFullYear();
        const inputMonth = parseInt(rememberMonth, 10);
        const inputDay = parseInt(rememberDay, 10);
        // Si la fecha ya pasó este año, usar el próximo año
        let eventYear = currentYear;
        if (
            inputMonth < now.getMonth() + 1 ||
            (inputMonth === now.getMonth() + 1 && inputDay < now.getDate())
        ) {
            eventYear = currentYear + 1;
        }
        const dateStr = `${eventYear}-${rememberMonth.padStart(2, '0')}-${rememberDay.padStart(2, '0')}`;
        router.post('/calendario', {
            _method: 'post',
            title,
            startdate: dateStr,
            enddate: dateStr,
            color,
        });
        setIsRememberOpen(false);
        setRememberDay('');
        setRememberMonth('');
        setRememberType(null);
    };

    return (
        <aside className="w-90 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm dark:from-gray-900 dark:to-gray-800">
            <div className="border-b bg-white p-4 dark:bg-gray-900">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        className={`text-lm flex flex-1 cursor-pointer items-center justify-center gap-2 py-2 font-medium transition-colors ${
                            activeTab === 'panel'
                                ? 'border-b-2 border-emerald-600 text-emerald-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                        onClick={() => setActiveTab('panel')}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                            />
                        </svg>
                        Panel de Control
                    </button>

                    {selected &&
                        selected.id !== 1 &&
                        selected.id !== undefined && (
                            <button
                                className={`text-lm flex flex-1 cursor-pointer items-center justify-center gap-2 py-2 font-medium transition-colors ${
                                    activeTab === 'comments'
                                        ? 'border-b-2 border-emerald-600 text-emerald-600'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                                onClick={() => setActiveTab('comments')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-message-circle-plus-icon lucide-message-circle-plus"
                                >
                                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                                    <path d="M8 12h8" />
                                    <path d="M12 8v8" />
                                </svg>
                                Comentarios
                                {hasComments && (
                                    <span className="relative flex size-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
                                    </span>
                                )}
                            </button>
                        )}
                </div>
            </div>

            <div className="max-h-[calc(100vh-20rem)] space-y-4 overflow-auto p-4">
                {activeTab === 'panel' &&
                    (selected ? (
                        <div className="space-y-4">
                            {/* Modal para día y mes */}
                            <Dialog
                                open={isRememberOpen}
                                onOpenChange={setIsRememberOpen}
                            >
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {rememberType === 'birth'
                                                ? 'Recordar nacimiento'
                                                : 'Recordar fallecimiento'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleRememberSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                placeholder="Día"
                                                value={rememberDay}
                                                onChange={(e) =>
                                                    setRememberDay(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <Input
                                                type="number"
                                                min="1"
                                                max="12"
                                                placeholder="Mes"
                                                value={rememberMonth}
                                                onChange={(e) =>
                                                    setRememberMonth(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700"
                                        >
                                            Agregar al calendario
                                        </button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            {selected.isMarriageNode ? (
                                /* Enhanced Marriage Node Panel */
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-100 dark:bg-yellow-800">
                                                <span
                                                    className="text-lg"
                                                    role="img"
                                                    aria-label="Matrimonio"
                                                >
                                                    ♥
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                                                    Nodo de Matrimonio
                                                </div>
                                                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                                    Relación de pareja
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Desde este nodo puedes agregar
                                                hijos que pertenecerán a ambos
                                                cónyuges.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions for marriage node */}
                                    <div className="space-y-2 border-t pt-4">
                                        <button
                                            onClick={() => {
                                                setAddRelationType('child');
                                                setShowAddModal(true);
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            aria-label="Agregar hijo a la pareja"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                            </svg>
                                            Añadir hijo/a
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Regular Member Panel */
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                                        <div className="mb-4 flex items-center gap-3">
                                            <img
                                                src={
                                                    selected.img ||
                                                    '/imagenes/logo Arbol.png'
                                                }
                                                alt={`Foto de ${selected.name}`}
                                                className="h-16 w-16 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {selected.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    ID: {selected.key}
                                                </div>
                                                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    {selected.gender === 'M'
                                                        ? '♂ Masculino'
                                                        : selected.gender ===
                                                            'F'
                                                          ? '♀ Femenino'
                                                          : '⚪ Otro'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit fields */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nombre completo
                                            </label>
                                            <input
                                                value={selected.name || ''}
                                                onChange={(e) =>
                                                    updateSelectedMember({
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                placeholder="Nombre y apellidos"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Género
                                            </label>
                                            <select
                                                value={
                                                    selected.gender || 'Other'
                                                }
                                                onChange={(e) =>
                                                    updateSelectedMember({
                                                        gender: e.target
                                                            .value as
                                                            | 'M'
                                                            | 'F'
                                                            | 'Other',
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            >
                                                <option value="M">
                                                    ♂ Masculino
                                                </option>
                                                <option value="F">
                                                    ♀ Femenino
                                                </option>
                                                <option value="Other">
                                                    ⚪ Otro
                                                </option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Año nacimiento
                                                </label>
                                                <input
                                                    type="number"
                                                    value={
                                                        selected.birthYear || ''
                                                    }
                                                    onChange={(e) =>
                                                        updateSelectedMember({
                                                            birthYear: e.target
                                                                .value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : undefined,
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    placeholder="1990"
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Año fallecimiento
                                                </label>
                                                <input
                                                    type="number"
                                                    value={
                                                        selected.deathYear || ''
                                                    }
                                                    onChange={(e) =>
                                                        updateSelectedMember({
                                                            deathYear: e.target
                                                                .value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : undefined,
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    placeholder="Opcional"
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>
                                        </div>
                                        {/* Botón Recordar fechas */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {selected.birthYear && (
                                                <button
                                                    className="rounded bg-emerald-500 px-3 py-1 text-xs text-white hover:bg-emerald-600"
                                                    onClick={() =>
                                                        openRememberModal(
                                                            'birth',
                                                        )
                                                    }
                                                >
                                                    Recordar nacimiento
                                                </button>
                                            )}
                                            {selected.deathYear && (
                                                <button
                                                    className="rounded bg-rose-500 px-3 py-1 text-xs text-white hover:bg-rose-600"
                                                    onClick={() =>
                                                        openRememberModal(
                                                            'death',
                                                        )
                                                    }
                                                >
                                                    Recordar fallecimiento
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Imagen (URL)
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    value={selected.img || ''}
                                                    onChange={(e) =>
                                                        updateSelectedMember({
                                                            img: e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    placeholder="https://ejemplo.com/foto.jpg"
                                                />
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-800"
                                                    onClick={openPhotosModal}
                                                    title="Elegir de Mis Fotos"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V4a2 2 0 012-2h12a2 2 0 012 2v12M4 16l4-4a2 2 0 012.828 0l2.344 2.344a2 2 0 002.828 0L20 8M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4" /></svg>
                                                    Mis Fotos
                                                </button>
                                            </div>
                                            <UserPhotosModal
                                                open={showPhotosModal}
                                                photos={userPhotos}
                                                onSelect={(url) => {
                                                    updateSelectedMember({ img: url });
                                                    setShowPhotosModal(false);
                                                }}
                                                onClose={() => setShowPhotosModal(false)}
                                            />
                                            {loadingPhotos && showPhotosModal && (
                                                <div className="text-xs text-gray-400 mt-2">Cargando fotos...</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions for regular members */}
                                    <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={addRelationType}
                                                onChange={(e) =>
                                                    setAddRelationType(
                                                        e.target.value as
                                                            | 'child'
                                                            | 'spouse'
                                                            | 'parent',
                                                    )
                                                }
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                aria-label="Tipo de relación a agregar"
                                            >
                                                <option value="child">
                                                    👶 Hijo/a
                                                </option>
                                                <option value="spouse">
                                                    💑 Cónyuge
                                                </option>
                                                <option value="parent">
                                                    👨‍👩‍👧‍👦 Padre/Madre
                                                </option>
                                            </select>
                                            <button
                                                onClick={() =>
                                                    setShowAddModal(true)
                                                }
                                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                aria-label={`Agregar ${addRelationType}`}
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                                Añadir
                                            </button>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setShowDeleteModal(true)
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:outline-none dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                                            aria-label={`Eliminar ${selected.name}`}
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            Eliminar miembro
                                        </button>

                                        {/* Family Relationships Section */}
                                        <div className="mt-4 rounded-xl border-0 bg-white p-5 dark:bg-gray-800">
                                            <h4 className="mb-4 text-sm font-medium tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                                Relaciones Familiares
                                            </h4>
                                            <div className="max-h-64 space-y-1 overflow-y-auto">
                                                {getAllRelationships(selected)
                                                    .length > 0 ? (
                                                    getAllRelationships(
                                                        selected,
                                                    ).map((rel, index) => (
                                                        <div
                                                            key={index}
                                                            className="group flex items-center justify-between border-b border-gray-100 px-1 py-3 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                                        {
                                                                            rel.relationship
                                                                        }
                                                                    </span>
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {
                                                                            rel
                                                                                .member
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                                {rel.member
                                                                    .gender ===
                                                                'M'
                                                                    ? '♂'
                                                                    : rel.member
                                                                            .gender ===
                                                                        'F'
                                                                      ? '♀'
                                                                      : '○'}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-6 text-center">
                                                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                            <span className="text-sm text-gray-400">
                                                                👤
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            Sin relaciones
                                                            detectadas
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/*----------------------------- TagSelector */}
                                            <TagSelector
                                                nodeId={selected?.id}
                                                refreshAllTags={refreshAllTags}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <div className="mb-4">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <p className="mb-4 text-gray-500 dark:text-gray-400">
                                Selecciona un miembro del árbol para ver y
                                editar sus datos
                            </p>
                            <button
                                onClick={() => {
                                    setSelected({
                                        key: 'root',
                                        name: '',
                                        gender: 'M',
                                    } as FamilyMember);
                                    setShowAddModal(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Crear primer miembro
                            </button>
                        </div>
                    ))}
                {activeTab === 'comments' &&
                    selected &&
                    selected.id !== 1 &&
                    selected.id !== undefined && (
                        <CommentSection
                            nodeId={selected.id as number}
                            onCommentsChange={(count) =>
                                setHasComments(count > 0)
                            }
                        />
                    )}
            </div>
        </aside>
    );
}
