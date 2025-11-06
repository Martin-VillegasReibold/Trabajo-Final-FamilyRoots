import { useState, useEffect, useCallback } from 'react';
// Hook encargado de manejar el estado del espacio de trabajo del árbol genealógico, 
// incluyendo la carga, guardado y manejo de errores.
interface FamilyMember {
    id?: number | string;
    key: number | string;
    name: string;
    gender?: 'M' | 'F' | 'Other';
    birthYear?: number;
    deathYear?: number;
    img?: string;
    spouses?: (number | string)[];
    parents?: (number | string)[];
}

interface TreeData {
    nodes: FamilyMember[];
    links: unknown[];
}

interface UseFamilyTreeWorkspaceReturn {
    familyMembers: FamilyMember[];
    setFamilyMembers: (members: FamilyMember[]) => void;
    saveTreeData: () => Promise<void>;
    loading: boolean;
    error: string | null;
    lastSaved: Date | null;
    isDirty: boolean;
}

function getCsrfToken(): string {
    // Intentar obtener el token de varias fuentes
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!token) {
        // Intentar desde el input hidden de formularios
        const csrfInput = document.querySelector('input[name="_token"]') as HTMLInputElement;
        token = csrfInput?.value;
    }
    
    if (!token) {
        // Intentar desde window si está disponible
        token = (window as { _token?: string })._token;
    }
    
    return token || '';
}

export function useFamilyTreeWorkspace(
    treeId: number,
    initialData?: TreeData
): UseFamilyTreeWorkspaceReturn {
    const [familyMembers, setFamilyMembersState] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    useEffect(() => {
        if (initialData && !initialDataLoaded) {
            if (initialData.nodes && initialData.nodes.length > 0) {
                setFamilyMembersState(
                    initialData.nodes.map(node => ({
                        ...node,
                        id: node.id ?? node.key,
                    }))
                );
            } else {
                /*setFamilyMembersState([
                    {
                        id: 1,
                        key: 1,
                        name: 'Miembro Principal',
                        gender: 'M',
                        birthYear: 1980,
                        img: '/imagenes/logo Arbol.png',
                        spouses: [],
                        parents: [],
                    }
                ]);*/
            }
            setInitialDataLoaded(true);
        }
    }, [initialData, initialDataLoaded]);

    const setFamilyMembers = useCallback((members: FamilyMember[]) => {
        setFamilyMembersState(members);
        setIsDirty(true);
        setError(null);
    }, []);

    const saveTreeData = useCallback(async () => {
        if (!isDirty) return;

        setLoading(true);
        setError(null);

        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                const csrfToken = getCsrfToken();
                
                if (!csrfToken) {
                    throw new Error('Token CSRF no encontrado. Por favor, recarga la página.');
                }

                // Generar enlaces a partir de las relaciones en los nodos
                const links: { from: string | number; to: string | number; relationship: string }[] = [];
                
                familyMembers.forEach(member => {
                    // Enlaces de padres a hijos
                    if (member.parents && Array.isArray(member.parents)) {
                        member.parents.forEach(parentKey => {
                            links.push({
                                from: parentKey,
                                to: member.key,
                                relationship: 'parent'
                            });
                        });
                    }
                    
                    // Enlaces de cónyuges
                    if (member.spouses && Array.isArray(member.spouses)) {
                        member.spouses.forEach(spouseKey => {
                            // Evitar enlaces duplicados (solo agregar si from < to)
                            if (member.key < spouseKey) {
                                links.push({
                                    from: member.key,
                                    to: spouseKey,
                                    relationship: 'spouse'
                                });
                            }
                        });
                    }
                });

                const data = {
                    nodes: familyMembers,
                    links: links
                };

                const response = await fetch(`/arboles/api/${treeId}/save-data`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    if (response.status === 419 && attempts < maxAttempts - 1) {
                        // Token CSRF expirado, intentar recargar el token
                        attempts++;
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
                        continue;
                    }
                    
                    if (response.status === 419) {
                        throw new Error('Sesión expirada. Por favor, recarga la página.');
                    }
                    
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }

                const responseData = await response.json();
                // Verificamos que la respuesta tenga data.nodes
                if (responseData.data && Array.isArray(responseData.data.nodes)) {
                    const updatedNodes = responseData.data.nodes.map((node: FamilyMember) => ({
                        ...node,
                        id: node.id ?? node.key // aseguramos que todos tengan un id válido
                    }));
                    setFamilyMembersState(updatedNodes);
                }

                setLastSaved(new Date());
                setIsDirty(false);
                break; // Éxito, salir del bucle
                
            } catch (err) {
                if (attempts >= maxAttempts - 1) {
                    console.error('Error saving tree data:', err);
                    setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
                    break;
                }
                attempts++;
            }
        }
        
        setLoading(false);
    }, [treeId, familyMembers, isDirty]);

    // Auto-guardar cada 30 segundos si hay cambios
    useEffect(() => {
        if (!isDirty) return;

        const autoSaveInterval = setInterval(() => {
            saveTreeData();
        }, 30000); // 30 segundos

        return () => clearInterval(autoSaveInterval);
    }, [isDirty, saveTreeData]);

    // Guardar antes de cerrar la ventana
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return {
        familyMembers,
        setFamilyMembers,
        saveTreeData,
        loading,
        error,
        lastSaved,
        isDirty,
    };
}