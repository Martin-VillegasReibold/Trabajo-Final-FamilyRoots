import FamilyTree2 from '@/components/FamilyTree/FamilyTree2';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useFamilyTreeWorkspace } from '@/components/FamilyTree/useFamilyTreeWorkspace';

interface Arbol {
    id: number;
    name: string;
}

interface TreeData {
    nodes: FamilyMember[];
    links: unknown[];
}

interface PageProps {
    arbol: Arbol;
    initialTreeData?: TreeData;
    [key: string]: unknown;
}

interface FamilyMember {
    key: number | string;
    name: string;
    gender?: 'M' | 'F' | 'Other';
    birthYear?: number;
    deathYear?: number;
    img?: string;
    spouses?: (number | string)[];
    parents?: (number | string)[];
}

export default function EspacioTrabajo() {
    const { arbol, initialTreeData } = usePage<PageProps>().props;
    
    const {
        familyMembers,
        setFamilyMembers,
        saveTreeData,
        loading,
        error,
        lastSaved,
        isDirty,
    } = useFamilyTreeWorkspace(arbol.id, initialTreeData);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Árboles', href: '/arboles' },
        { title: arbol.name, href: `/espacio-trabajo/${arbol.id}` },
    ];

    const handleFamilyDataChange = (newMembers: FamilyMember[]) => {
        setFamilyMembers(newMembers);
    };

    const handleManualSave = async () => {
        await saveTreeData();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Espacio de trabajo - ${arbol.name}`} />

            <div className="p-2">
                <FamilyTree2
                    members={familyMembers}
                    onDataChange={handleFamilyDataChange}
                    // Pasar props de estado al Toolbar a través de FamilyTree2
                    toolbarProps={{
                        loading,
                        error,
                        lastSaved,
                        isDirty,
                        onManualSave: handleManualSave
                    }}
                />
            </div>
        </AppLayout>
    );
}
