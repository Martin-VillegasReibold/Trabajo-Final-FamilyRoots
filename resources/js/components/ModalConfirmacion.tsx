interface ModalConfirmacionProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ModalConfirmacion({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar eliminación",
    message = "¿Estás seguro de que quieres eliminar este Arbol? Esta acción no se puede deshacer.",
    confirmText = "Eliminar",
    cancelText = "Cancelar"
}: ModalConfirmacionProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 backdrop-blur bg-opacity-30 flex items-center justify-center z-50 p-4"onClick={onClose} >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md"onClick={(e) => e.stopPropagation()} >
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>

                <div className="p-6">
                    <p className="text-gray-600">{message}</p>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium">
                        {cancelText}
                    </button>

                    <button type="button"onClick={() => {onConfirm();onClose();}}className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
