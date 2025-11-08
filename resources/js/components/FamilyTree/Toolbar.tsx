import React from 'react';
import { usePage, useForm } from '@inertiajs/react';
import { Save, Clock, AlertCircle } from 'lucide-react';
import TreeSearch from './TreeSearch';

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

interface ToolbarProps {
    zoomIn: () => void;
    zoomOut: () => void;
    fitToView: () => void;
    // Props para barra de estado
    loading?: boolean;
    error?: string | null;
    lastSaved?: Date | null;
    isDirty?: boolean;
    onManualSave?: () => void;
    // Props para TreeSearch
    members?: FamilyMember[];
    onSelectMember?: (member: FamilyMember) => void;
    onFocusMember?: (memberKey: string | number) => void;
}

interface Arbol {
    id: number;
    name: string;
}

interface PageProps {
    arbol: Arbol;
    [key: string]: unknown;
}

export default function Toolbar({
    zoomIn,
    zoomOut,
    fitToView,
    loading = false,
    error = null,
    lastSaved = null,
    isDirty = false,
    onManualSave,
    members = [],
    onSelectMember,
    onFocusMember
}: ToolbarProps) {
    const { arbol } = usePage<PageProps>().props;
       // Formulario con Inertia
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/arboles/${arbol.id}/invitar`);
    };
    return (
        <div className="mb-3 space-y-3">
            {/* Barra de estado principal */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{arbol.name}</h1>

                    {/* Indicador de estado */}
                    <div className="flex items-center space-x-2">
                        {isDirty && (
                            <span className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                                <Clock className="w-4 h-4 mr-1" />
                                Cambios sin guardar
                            </span>
                        )}

                        {lastSaved && !isDirty && (
                            <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Guardado {lastSaved.toLocaleTimeString()}
                            </span>
                        )}

                        {error && (
                            <span className="flex items-center text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {error}
                            </span>
                        )}

                        {!isDirty && !lastSaved && !error && (
                            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Listo para editar
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        placeholder="Correo del invitado"
                        required
                        className="border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        Invitar
                    </button>
                    {errors.email && (
                        <span className="text-red-500 text-sm">{errors.email}</span>
                    )}
                </form>


                {/* Botón de guardar manual */}
                {onManualSave && (
                    <button
                        onClick={onManualSave}
                        disabled={loading || !isDirty}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                )}
            </div>

            {/* Controles de herramientas */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-4">
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={zoomOut}
                        className="inline-flex items-center justify-center w-8 h-8 rounded text-sm font-medium hover:bg-white dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        title="Disminuir zoom (tecla -)"
                        aria-label="Disminuir zoom"
                    >
                        <span className="text-lg">−</span>
                    </button>
                    <button
                        type="button"
                        onClick={zoomIn}
                        className="inline-flex items-center justify-center w-8 h-8 rounded text-sm font-medium hover:bg-white dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        title="Aumentar zoom (tecla +)"
                        aria-label="Aumentar zoom"
                    >
                        <span className="text-lg">+</span>
                    </button>
                    <button
                        type="button"
                        onClick={fitToView}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium hover:bg-white dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        title="Ajustar al contenido (tecla f)"
                        aria-label="Ajustar diagrama a la vista"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Ajustar
                    </button>
                </div>

                {/* Tree Search Component */}
                {onSelectMember && onFocusMember && (
                    <div className="flex-1 max-w-md mx-4">
                        <TreeSearch
                            members={members}
                            onSelectMember={onSelectMember}
                            onFocusMember={onFocusMember}
                        />
                    </div>
                )}

                {/* Compact help tooltip */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="opacity-60">Ayuda:</span>
                    <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Click</kbd>
                    <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">+/-</kbd>
                    <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">f</kbd>
                    <span className="text-xs opacity-60 ml-2">| Shift+Arrastrar para conectar</span>
                </div>
            </div>
        </div>
    );
}