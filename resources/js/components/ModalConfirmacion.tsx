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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/60 dark:border-gray-700/60"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300">{message}</p>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
