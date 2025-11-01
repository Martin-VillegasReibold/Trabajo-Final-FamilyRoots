import { useState } from 'react';
// Hook para gestionar los miembros de la familia y sus relaciones en general.
export interface FamilyMember {
    id?: number | string; 
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
    hasIllness?: boolean;
}

export function useFamilyMemberManagement(
    members: FamilyMember[], 
    onDataChange?: (members: FamilyMember[]) => void
) {
    const [selected, setSelected] = useState<FamilyMember | null>(null);
    const [newMember, setNewMember] = useState<{
        name: string;
        gender: 'M' | 'F' | 'Other';
        birthYear: number | undefined;
        img: string;
    }>({
        name: '',
        gender: 'M',
        birthYear: undefined,
        img: '/imagenes/logo Arbol.png'
    });

    // Update member function
    const updateSelectedMember = (updates: Partial<FamilyMember>) => {
        if (!selected || selected.isMarriageNode) return;

        const updatedMembers = members.map(member =>
            member.key === selected.key ? { ...member, ...updates } : member
        );
        onDataChange?.(updatedMembers);
        setSelected({ ...selected, ...updates });
    };

    // Add new member function
  const addNewMember = async (
        addRelationType: 'child' | 'parent' | 'spouse',
        setShowAddModal: (show: boolean) => void
    ) => {
        if (!newMember.name.trim() || !selected) return;

        const newKey = Date.now();
        const newMemberData: FamilyMember = {
            id: undefined, // se completará al guardar en backend
            key: newKey,
            name: newMember.name,
            gender: newMember.gender,
            birthYear: newMember.birthYear,
            img: newMember.img,
            spouses: [],
            parents: []
        };

        // Asignar relaciones iniciales según tipo
        switch (addRelationType) {
            case 'child':
                newMemberData.parents = selected.isMarriageNode ? selected.spouseKeys || [] : [selected.key];
                break;
            case 'spouse':
                newMemberData.spouses = [selected.key];
                break;
            case 'parent':
                break;
        }

        // Construir array de miembros actualizado localmente
        let updatedMembers = [...members, newMemberData];

        // Actualizar relaciones de nodo seleccionado si aplica
        switch (addRelationType) {
            case 'spouse':
                updatedMembers = updatedMembers.map(member =>
                    member.key === selected.key
                        ? { ...member, spouses: [...(member.spouses || []), newKey] }
                        : member
                );
                break;
            case 'parent':
                updatedMembers = updatedMembers.map(member =>
                    member.key === selected.key
                        ? { ...member, parents: [...(member.parents || []), newKey] }
                        : member
                );
                break;
        }

        onDataChange?.(updatedMembers);
        setNewMember({ name: '', gender: 'M', birthYear: undefined, img: '/imagenes/logo Arbol.png' });
        setShowAddModal(false);
    };


    // Remove member function
    const removeSelectedMember = (setShowDeleteModal: (show: boolean) => void) => {
        if (!selected || selected.isMarriageNode) return;

        const updatedMembers = members
            .filter(member => member.key !== selected.key)
            .map(member => ({
                ...member,
                spouses: member.spouses?.filter(spouseKey => spouseKey !== selected.key) || [],
                parents: member.parents?.filter(parentKey => parentKey !== selected.key) || []
            }));

        onDataChange?.(updatedMembers);
        setSelected(null);
        setShowDeleteModal(false);
    };

    return {
        selected,
        setSelected,
        newMember,
        setNewMember,
        updateSelectedMember,
        addNewMember,
        removeSelectedMember
    };
}