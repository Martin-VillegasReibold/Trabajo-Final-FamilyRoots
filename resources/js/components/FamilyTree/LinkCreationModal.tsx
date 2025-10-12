import React from 'react';
import * as go from 'gojs';

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

interface LinkCreationData {
    from: string | number;
    to: string | number;
    link: go.Link | null;
}

interface LinkCreationModalProps {
    showLinkModal: boolean;
    setShowLinkModal: (show: boolean) => void;
    linkCreationData: LinkCreationData | null;
    setLinkCreationData: (data: LinkCreationData | null) => void;
    members: FamilyMember[];
    onDataChange?: (members: FamilyMember[]) => void;
    diagramRef: React.RefObject<go.Diagram | null>;
}

export default function LinkCreationModal({
    showLinkModal,
    setShowLinkModal,
    linkCreationData,
    setLinkCreationData,
    members,
    onDataChange,
    diagramRef
}: LinkCreationModalProps) {
    const handleClose = () => {
        setShowLinkModal(false);
        setLinkCreationData(null);
        // Remove the temporary link
        if (linkCreationData?.link && diagramRef.current) {
            diagramRef.current.remove(linkCreationData.link);
        }
    };

    const handleLinkCreation = (relationshipType: 'parent' | 'spouse' | 'child') => {
        if (!linkCreationData) return;

        const fromMember = members.find(m => m.key === linkCreationData.from);
        const toMember = members.find(m => m.key === linkCreationData.to);
        
        if (!fromMember || !toMember) return;

        let updatedMembers = [...members];

        switch (relationshipType) {
            case 'parent':
                // From is parent of To
                updatedMembers = updatedMembers.map(member => 
                    member.key === toMember.key 
                        ? { ...member, parents: [...(member.parents || []), fromMember.key] }
                        : member
                );
                break;
            case 'child':
                // From is child of To
                updatedMembers = updatedMembers.map(member => 
                    member.key === fromMember.key 
                        ? { ...member, parents: [...(member.parents || []), toMember.key] }
                        : member
                );
                break;
            case 'spouse':
                // From and To are spouses
                updatedMembers = updatedMembers.map(member => {
                    if (member.key === fromMember.key) {
                        return { ...member, spouses: [...(member.spouses || []), toMember.key] };
                    } else if (member.key === toMember.key) {
                        return { ...member, spouses: [...(member.spouses || []), fromMember.key] };
                    }
                    return member;
                });
                break;
        }

        onDataChange?.(updatedMembers);
        setShowLinkModal(false);
        setLinkCreationData(null);
    };

    if (!showLinkModal || !linkCreationData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={handleClose} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Crear Relación Familiar
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ¿Qué relación tienen estas personas?
                </p>
                
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => handleLinkCreation('parent')}
                        className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="font-medium">👨‍👩‍👧‍👦 Es padre/madre</div>
                        <div className="text-xs text-gray-500">La primera persona es padre/madre de la segunda</div>
                    </button>
                    
                    <button
                        onClick={() => handleLinkCreation('child')}
                        className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="font-medium">👶 Es hijo/a</div>
                        <div className="text-xs text-gray-500">La primera persona es hijo/a de la segunda</div>
                    </button>
                    
                    <button
                        onClick={() => handleLinkCreation('spouse')}
                        className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="font-medium">💑 Son cónyuges</div>
                        <div className="text-xs text-gray-500">Las personas están casadas o en pareja</div>
                    </button>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}