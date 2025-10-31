import React from 'react';
import UserPhotosModal, { UserPhoto } from './UserPhotosModal';
import axios from 'axios';

interface FamilyMember {
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

interface NewMember {
    name: string;
    gender: 'M' | 'F' | 'Other';
    birthYear: number | undefined;
    img: string;
}

interface AddMemberModalProps {
    showAddModal: boolean;
    setShowAddModal: (show: boolean) => void;
    selected: FamilyMember | null;
    addRelationType: 'child' | 'spouse' | 'parent';
    newMember: NewMember;
    setNewMember: React.Dispatch<React.SetStateAction<NewMember>>;
    addNewMember: () => void;
    modalConfirmRef: React.RefObject<HTMLButtonElement | null>;
    modalCancelRef: React.RefObject<HTMLButtonElement | null>;
}

export default function AddMemberModal({
    showAddModal,
    setShowAddModal,
    selected,
    addRelationType,
    newMember,
    setNewMember,
    addNewMember,
    modalConfirmRef,
    modalCancelRef
}: AddMemberModalProps) {
    // Estado para el modal de fotos de usuario
    const [showPhotosModal, setShowPhotosModal] = React.useState(false);
    const [userPhotos, setUserPhotos] = React.useState<UserPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = React.useState(false);

    const openPhotosModal = async () => {
        setShowPhotosModal(true);
        setLoadingPhotos(true);
        try {
            const res = await axios.get('/api/mis-fotos');
            setUserPhotos(res.data.fotos || []);
        } catch {
            setUserPhotos([]);
        } finally {
            setLoadingPhotos(false);
        }
    };

    if (!showAddModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={() => setShowAddModal(false)} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {selected?.isMarriageNode 
                        ? 'Añadir hijo/a de la pareja' 
                        : `Añadir ${addRelationType === 'child' ? 'hijo/a' : 
                                   addRelationType === 'spouse' ? 'cónyuge' : 'padre/madre'}`}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre completo *
                        </label>
                        <input
                            value={newMember.name || ''}
                            onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Ej: Juan Pérez"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Género
                        </label>
                        <select
                            value={newMember.gender}
                            onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' | 'Other' }))}
                            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="Other">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Año de nacimiento
                        </label>
                        <input
                            type="number"
                            value={newMember.birthYear || ''}
                            onChange={(e) => setNewMember(prev => ({ ...prev, birthYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Ej: 1990"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Imagen (URL)
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                value={newMember.img || ''}
                                onChange={(e) => setNewMember(prev => ({ ...prev, img: e.target.value }))}
                                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="https://..."
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
                                setNewMember(prev => ({ ...prev, img: url }));
                                setShowPhotosModal(false);
                            }}
                            onClose={() => setShowPhotosModal(false)}
                        />
                        {loadingPhotos && showPhotosModal && (
                            <div className="text-xs text-gray-400 mt-2">Cargando fotos...</div>
                        )}
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <button
                        ref={modalCancelRef}
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        ref={modalConfirmRef}
                        onClick={addNewMember}
                        disabled={!newMember.name.trim()}
                        className="flex-1 rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Añadir
                    </button>
                </div>
            </div>
        </div>
    );
}