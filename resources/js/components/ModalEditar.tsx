import { useState, useEffect } from 'react';

interface ModalEditarProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (nuevoNombre: string) => void;
    nombreActual: string;
    title?: string;
}

export default function ModalEditar({
    isOpen,
    onClose,
    onSave,
    nombreActual,
    title = "Editar árbol"
}: ModalEditarProps) {
    const [nombre, setNombre] = useState(nombreActual);
    const [error, setError] = useState('');

    useEffect(() => {
        setNombre(nombreActual);
        setError(''); 
    }, [nombreActual]);

    // Funcion para validar el nombre
    const validarNombre = (texto: string): boolean => {
        const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.,-]*$/;
        return regex.test(texto);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        
        if (validarNombre(valor)) {
            setNombre(valor);
            setError('');
        } else {
            setError('Solo se permiten letras, espacios y los caracteres: - . ,');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim() && !error) {
            onSave(nombre.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/60 dark:border-gray-700/60"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    </div>

                    {/* Campo de texto */}
                    <div className="p-6">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Nombre del árbol
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            placeholder="Ingresa el nombre del árbol"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!nombre.trim() || !!error}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}