import { useMemo } from 'react';
// Hook para determinar las relaciones familiares entre los miembros del 
// árbol genealógico(apartado de panel de control).
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

export interface RelationshipResult {
    member: FamilyMember;
    relationship: string;
}

export function useFamilyRelationships(members: FamilyMember[]) {
    const familyFunctions = useMemo(() => {
        const findPerson = (key: string | number) => members.find(m => m.key === key && !m.isMarriageNode);

        const getSiblingRelationship = (person1: FamilyMember, person2: FamilyMember): string => {
            if (!person1.parents || !person2.parents) return '';
            
            const person1Parents = new Set(person1.parents);
            const person2Parents = new Set(person2.parents);
            const sharedParents = [...person1Parents].filter(parent => person2Parents.has(parent));
            
            if (sharedParents.length === 2 && person1.parents.length === 2 && person2.parents.length === 2) {
                return 'Mi Hermano/a es';
            } else if (sharedParents.length === 1) {
                return 'Mi Hermanastro/a es';
            }
            
            return '';
        };

        const getGrandparentRelationship = (person1: FamilyMember, person2: FamilyMember): string => {
            // Check if person1 is grandparent of person2
            if (person2.parents) {
                for (const parentKey of person2.parents) {
                    const parent = findPerson(parentKey);
                    if (parent && parent.parents?.includes(person1.key)) {
                        return 'Soy Abuelo/a de';
                    }
                }
            }
            
            // Check if person2 is grandparent of person1
            if (person1.parents) {
                for (const parentKey of person1.parents) {
                    const parent = findPerson(parentKey);
                    if (parent && parent.parents?.includes(person2.key)) {
                        return 'Soy Nieto/a de';
                    }
                }
            }
            
            return '';
        };

        const getUncleAuntRelationship = (person1: FamilyMember, person2: FamilyMember): string => {
            // Helper function to check if person is uncle/aunt
            const isUncleAunt = (uncle: FamilyMember, nephew: FamilyMember): boolean => {
                if (!nephew.parents) return false;
                return nephew.parents.some(parentKey => {
                    const parent = findPerson(parentKey);
                    return parent && parent.parents?.some(grandparentKey => {
                        const grandparent = findPerson(grandparentKey);
                        return grandparent && members.some(m => 
                            m.parents?.includes(grandparentKey) && m.key === uncle.key
                        );
                    });
                });
            };

            if (isUncleAunt(person1, person2)) return 'Soy Tío/a de';
            if (isUncleAunt(person2, person1)) return 'Soy Sobrino/a de';
            
            return '';
        };

        const getCousinRelationship = (person1: FamilyMember, person2: FamilyMember): string => {
            if (!person1.parents || !person2.parents) return '';
            
            // Get grandparents of both persons
            const getGrandparents = (person: FamilyMember) => {
                const grandparents = new Set<string | number>();
                person.parents?.forEach(parentKey => {
                    const parent = findPerson(parentKey);
                    parent?.parents?.forEach(gp => grandparents.add(gp));
                });
                return grandparents;
            };
            
            const person1Grandparents = getGrandparents(person1);
            const person2Grandparents = getGrandparents(person2);
            
            // Check for shared grandparents
            const sharedGrandparents = [...person1Grandparents].filter(gp => person2Grandparents.has(gp));
            
            if (sharedGrandparents.length > 0) {
                return 'Mi Primo/a es';
            }
            
            return '';
        };

        const getRelationship = (person1Key: string | number, person2Key: string | number): string => {
            const person1 = findPerson(person1Key);
            const person2 = findPerson(person2Key);
            
            if (!person1 || !person2 || person1Key === person2Key) return '';

            // Check for spouse relationship
            if (person1.spouses?.includes(person2Key)) return 'Mi Cónyuge es';
            
            // Check for parent-child relationship
            if (person1.parents?.includes(person2Key)) return 'Mi Padre/Madre es';
            if (person2.parents?.includes(person1Key)) return 'Mi Hijo/a es';
            
            // Check for sibling relationships
            const siblingType = getSiblingRelationship(person1, person2);
            if (siblingType) return siblingType;
            
            // Check for grandparent-grandchild relationships
            const grandparentRel = getGrandparentRelationship(person1, person2);
            if (grandparentRel) return grandparentRel;
            
            // Check for uncle/aunt - nephew/niece relationships
            const uncleAuntRel = getUncleAuntRelationship(person1, person2);
            if (uncleAuntRel) return uncleAuntRel;
            
            // Check for cousin relationships
            const cousinRel = getCousinRelationship(person1, person2);
            if (cousinRel) return cousinRel;
            
            return 'Sin relación directa';
        };

        const getAllRelationships = (selectedMember: FamilyMember): RelationshipResult[] => {
            if (!selectedMember || selectedMember.isMarriageNode) return [];
            
            return members
                .filter(member => !member.isMarriageNode && member.key !== selectedMember.key)
                .map(member => ({
                    member,
                    relationship: getRelationship(selectedMember.key, member.key)
                }))
                .filter(rel => rel.relationship && rel.relationship !== 'Sin relación directa')
                .sort((a, b) => {
                    const order = [
                        'Mi Cónyuge es', 'Mi Padre/Madre es', 'Mi Hijo/a es', 
                        'Mi Hermano/a es', 'Mi Hermanastro/a es',
                        'Soy Abuelo/a de', 'Soy Nieto/a de',
                        'Soy Tío/a de', 'Soy Sobrino/a de',
                        'Mi Primo/a es'
                    ];
                    return order.indexOf(a.relationship) - order.indexOf(b.relationship);
                });
        };

        return {
            findPerson,
            getRelationship,
            getAllRelationships,
            getSiblingRelationship,
            getGrandparentRelationship,
            getUncleAuntRelationship,
            getCousinRelationship
        };
    }, [members]);

    return familyFunctions;
}