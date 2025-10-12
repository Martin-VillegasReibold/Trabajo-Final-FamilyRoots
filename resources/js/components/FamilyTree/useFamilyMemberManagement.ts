import { useState } from 'react';
// Hook para gestionar los miembros de la familia y sus relaciones en general.
export interface FamilyMember {
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
    const addNewMember = (
        addRelationType: 'child' | 'parent' | 'spouse',
        setShowAddModal: (show: boolean) => void
    ) => {
        if (!newMember.name.trim() || !selected) return;

        const newKey = Date.now();
        const newMemberData: FamilyMember = {
            key: newKey,
            name: newMember.name,
            gender: newMember.gender,
            birthYear: newMember.birthYear,
            img: newMember.img,
            spouses: [],
            parents: []
        };

        let updatedMembers = [...members, newMemberData];

        // Handle relationships based on type
        switch (addRelationType) {
            case 'child':
                if (selected.isMarriageNode) {
                    // Adding child to a marriage node
                    newMemberData.parents = selected.spouseKeys || [];
                } else {
                    // Adding child to a regular member
                    newMemberData.parents = [selected.key];
                }
                break;
            case 'spouse':
                // Add spouse relationship
                updatedMembers = updatedMembers.map(member => {
                    if (member.key === selected.key) {
                        return { ...member, spouses: [...(member.spouses || []), newKey] };
                    }
                    return member;
                });
                newMemberData.spouses = [selected.key];
                break;
            case 'parent':
                // Add parent relationship
                updatedMembers = updatedMembers.map(member => {
                    if (member.key === selected.key) {
                        return { ...member, parents: [...(member.parents || []), newKey] };
                    }
                    return member;
                });
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