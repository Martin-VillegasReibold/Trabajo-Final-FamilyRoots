import React from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmRef?: React.RefObject<HTMLButtonElement | null>;
    cancelRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmRef, cancelRef }: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-desc"
                className="relative z-10 mx-4 w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-gray-800"
            >
                <h2 id="confirm-title" className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                {description && <p id="confirm-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>}

                <div className="mt-4 flex justify-end gap-2">
                    <button ref={cancelRef} onClick={onCancel} className="rounded border px-3 py-2 text-sm">Cancelar</button>
                    <button ref={confirmRef} onClick={onConfirm} className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">Confirmar</button>
                </div>
            </div>
        </div>
    );
}