import { useState, useEffect } from 'react';
// Hook para gestionar los miembros de la familia y sus relaciones en general.
export interface FamilyMember {
    id?: number | string; 
    key: number | string;
    name: string;
    gender?: 'M' | 'F' | 'Other';
    birth_date?: string;
    death_date?: string;
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
        birth_date?: string;
        death_date?: string;
        img: string;
    }>({
        name: '',
        gender: 'M',
        birth_date: '',
        death_date: '',
        img: '/imagenes/logo Arbol.png'
    });

    // Sincronizar el estado local 'selected' con el array global 'members' cada vez que 'members' cambie
    // Si el miembro seleccionado existe en el nuevo array, actualiza sus datos locales
    // Si no existe, lo deselecciona
    useEffect(() => {
        if (!selected) return;
        // Mantener selección para nodos virtuales (ej. nodo de matrimonio) que no existen en members
        if (selected.isMarriageNode) return;
        const updated = members.find(m => m.key === selected.key);
        if (updated) {
            setSelected(updated);
        } else {
            setSelected(null);
        }
    }, [members, selected]);

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
        if (!newMember.name.trim()) return;

        const newKey = Date.now();
        const newMemberData: FamilyMember = {
            id: undefined, // se completará al guardar en backend
            key: newKey,
            name: newMember.name,
            gender: newMember.gender,
            birth_date: newMember.birth_date,
            death_date: newMember.death_date,
            img: newMember.img,
            spouses: [],
            parents: []
        };

        // Asignar relaciones iniciales según tipo (si hay seleccionado)
        if (selected) {
            switch (addRelationType) {
                case 'child':
                    newMemberData.parents = selected.isMarriageNode ? selected.spouseKeys || [] : [selected.key];
                    break;
                case 'spouse':
                    newMemberData.spouses = [selected.key];
                    break;
                case 'parent':
                    // se manejará actualizando el seleccionado abajo
                    break;
            }
        }

        // Construir array de miembros actualizado localmente
        let updatedMembers = [...members, newMemberData];

        // Actualizar relaciones de nodo seleccionado si aplica
        if (selected) {
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
        }

        onDataChange?.(updatedMembers);
    setNewMember({ name: '', gender: 'M', birth_date: undefined, img: '/imagenes/logo Arbol.png' });
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