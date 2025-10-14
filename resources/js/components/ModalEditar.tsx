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
        const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\'\-\.\,]*$/;
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
            className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    </div>

                    {/* Campo de texto */}
                    <div className="p-6">
                        <label htmlFor="nombre" className="block text-sm font-medium text-black mb-2">
                            Nombre del árbol
                        </label>
                        <input  type="text" id="nombre" value={nombre} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" placeholder="Ingresa el nombre del árbol"autoFocus/>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 p-6 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium">
                            Cancelar
                        </button>
                        <button type="submit" disabled={!nombre.trim() || !!error} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}