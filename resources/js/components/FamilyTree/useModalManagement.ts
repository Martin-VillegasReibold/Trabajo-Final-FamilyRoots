import { useState, useRef, useEffect } from 'react';
// Hook para gestionar el estado de los modales (ventanas emergentes)
export function useModalManagement() {
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [addRelationType, setAddRelationType] = useState<'child' | 'parent' | 'spouse'>('child');
    const modalConfirmRef = useRef<HTMLButtonElement | null>(null);
    const modalCancelRef = useRef<HTMLButtonElement | null>(null);
    const prevFocusRef = useRef<HTMLElement | null>(null);

    // Manage focus when modal opens/closes
    useEffect(() => {
        if (showDeleteModal || showAddModal) {
            prevFocusRef.current = document.activeElement as HTMLElement | null;
            setTimeout(() => modalConfirmRef.current?.focus(), 0);

            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setShowDeleteModal(false);
                    setShowAddModal(false);
                }
            };
            document.addEventListener('keydown', onKeyDown);
            return () => {
                document.removeEventListener('keydown', onKeyDown);
            };
        } else {
            setTimeout(() => prevFocusRef.current?.focus(), 0);
        }
    }, [showDeleteModal, showAddModal]);

    return {
        showDeleteModal,
        setShowDeleteModal,
        showAddModal,
        setShowAddModal,
        addRelationType,
        setAddRelationType,
        modalConfirmRef,
        modalCancelRef,
        prevFocusRef
    };
}