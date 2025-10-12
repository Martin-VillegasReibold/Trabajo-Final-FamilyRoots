import React from 'react';

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
                        <input
                            value={newMember.img || ''}
                            onChange={(e) => setNewMember(prev => ({ ...prev, img: e.target.value }))}
                            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="https://..."
                        />
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