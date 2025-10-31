import React, { useState } from 'react'; 
import * as go from 'gojs';
import ConfirmModal from '@/components/FamilyTree/ConfirmModal';
import Toolbar from '@/components/FamilyTree/Toolbar';
import Inspector from '@/components/FamilyTree/Inspector';
import AddMemberModal from '@/components/FamilyTree/AddMemberModal';
import LinkCreationModal from '@/components/FamilyTree/LinkCreationModal';
import { useFamilyRelationships } from '@/components/FamilyTree/useFamilyRelationships';
import { useFamilyMemberManagement, type FamilyMember } from '@/components/FamilyTree/useFamilyMemberManagement';
import { useModalManagement } from '@/components/FamilyTree/useModalManagement';
import { useDiagramManagement } from '@/components/FamilyTree/useDiagramManagement';
import { useLinkCreation } from '@/components/FamilyTree/useLinkCreation';
import useAllNodeTags from '../../hooks/useAllNodeTags'; 


interface FamilyTree2Props {
    members: FamilyMember[];
    onDataChange?: (members: FamilyMember[]) => void;
    toolbarProps?: {
        loading?: boolean;
        error?: string | null;
        lastSaved?: Date | null;
        isDirty?: boolean;
        onManualSave?: () => void;
    };
}

    
    
export default function FamilyTree2({ members, onDataChange, toolbarProps }: FamilyTree2Props) {
    // Use modular hooks
    const modalManagement = useModalManagement();
    const memberManagement = useFamilyMemberManagement(members, onDataChange);
    const linkCreation = useLinkCreation(members, onDataChange);
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const memberIds = members.map(m => m.id).filter(Boolean) as (number | string)[];
    const { illnessMap } = useAllNodeTags(memberIds, refreshTrigger); 
    
    // Funcion para forzar recarga
    const refreshAllTags = () => setRefreshTrigger(prev => prev + 1)    
    
    const diagramManagement = useDiagramManagement(
        members,
        memberManagement.setSelected,
        linkCreation.handleLinkCreationStart,
        illnessMap 
    );

    // Family relationship functions
    const { getAllRelationships } = useFamilyRelationships(members);

    // Function to focus on a specific member in the diagram
    const focusOnMember = (memberKey: string | number) => {
        if (!diagramManagement.diagramRef.current) return;
        
        const diagram = diagramManagement.diagramRef.current;
        const node = diagram.findNodeForKey(memberKey);
        
        if (node) {
            // Center the node in the viewport
            diagram.startTransaction('focus member');
            diagram.centerRect(node.actualBounds);
            diagram.commitTransaction('focus member');
            
            // Select the node
            diagram.select(node);
            
            // Update selected member in state
            const member = members.find(m => m.key === memberKey);
            if (member) {
                memberManagement.setSelected(member);
            }
        }
    };

    // Keyboard navigation
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!diagramManagement.diagramRef.current) return;
        
        const diagram = diagramManagement.diagramRef.current;
        
        switch (e.key) {
            case '+':
            case '=':
                diagramManagement.zoomIn();
                e.preventDefault();
                break;
            case '-':
            case '_':
                diagramManagement.zoomOut();
                e.preventDefault();
                break;
            case '0':
            case 'f':
            case 'F':
                diagramManagement.fitToView();
                e.preventDefault();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight': {
                // Allow arrow keys to move selected nodes
                const selectedNode = diagram.selection.first();
                if (selectedNode instanceof go.Node && !selectedNode.data.isMarriageNode) {
                    const moveDistance = e.shiftKey ? 20 : 5;
                    let newX = selectedNode.location.x;
                    let newY = selectedNode.location.y;
                    
                    switch (e.key) {
                        case 'ArrowUp': newY -= moveDistance; break;
                        case 'ArrowDown': newY += moveDistance; break;
                        case 'ArrowLeft': newX -= moveDistance; break;
                        case 'ArrowRight': newX += moveDistance; break;
                    }
                    
                    diagram.startTransaction('move node');
                    selectedNode.location = new go.Point(newX, newY);
                    diagram.commitTransaction('move node');
                    e.preventDefault();
                }
                break;
            }
            default:
                break;
        }
    };

    return (
        <div className="rounded border bg-white p-3 dark:bg-gray-800 flex flex-col h-[calc(100vh-6rem)]">
            <Toolbar 
                zoomIn={diagramManagement.zoomIn}
                zoomOut={diagramManagement.zoomOut}
                fitToView={diagramManagement.fitToView}
                loading={toolbarProps?.loading}
                error={toolbarProps?.error}
                lastSaved={toolbarProps?.lastSaved}
                isDirty={toolbarProps?.isDirty}
                onManualSave={toolbarProps?.onManualSave}
                members={members}
                onSelectMember={memberManagement.setSelected}
                onFocusMember={focusOnMember}
            />

            <div className="flex gap-4 flex-1 min-h-0">
                {/* Diagram */}
                <div className="flex-1 min-w-0">
                    <div
                        ref={diagramManagement.divRef}
                        role="application"
                        aria-label="Diagrama del árbol genealógico"
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        className="w-full h-full border rounded"
                        style={{ minHeight: '400px' }}
                    />
                </div>

                {/* Enhanced Inspector Panel */}
                <Inspector
                    selected={memberManagement.selected}
                    addRelationType={modalManagement.addRelationType}
                    setAddRelationType={modalManagement.setAddRelationType}
                    setShowAddModal={modalManagement.setShowAddModal}
                    setShowDeleteModal={modalManagement.setShowDeleteModal}
                    setSelected={memberManagement.setSelected}
                    updateSelectedMember={memberManagement.updateSelectedMember}
                    getAllRelationships={getAllRelationships}
                    refreshAllTags={refreshAllTags}
                />
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                showAddModal={modalManagement.showAddModal}
                setShowAddModal={modalManagement.setShowAddModal}
                selected={memberManagement.selected}
                addRelationType={modalManagement.addRelationType}
                newMember={memberManagement.newMember}
                setNewMember={memberManagement.setNewMember}
                addNewMember={() => memberManagement.addNewMember(modalManagement.addRelationType, modalManagement.setShowAddModal)}
                modalConfirmRef={modalManagement.modalConfirmRef}
                modalCancelRef={modalManagement.modalCancelRef}
            />

            {/* Link Creation Modal */}
            <LinkCreationModal
                showLinkModal={linkCreation.showLinkModal}
                setShowLinkModal={linkCreation.setShowLinkModal}
                linkCreationData={linkCreation.linkCreationData}
                setLinkCreationData={linkCreation.setLinkCreationData}
                members={members}
                onDataChange={onDataChange}
                diagramRef={diagramManagement.diagramRef}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={modalManagement.showDeleteModal}
                title="Confirmar eliminación"
                description={`¿Estás seguro que quieres eliminar a ${memberManagement.selected?.name}? Esta acción no se puede deshacer y también eliminará todas las relaciones de esta persona.`}
                onCancel={() => modalManagement.setShowDeleteModal(false)}
                onConfirm={() => memberManagement.removeSelectedMember(modalManagement.setShowDeleteModal)}
                confirmRef={modalManagement.modalConfirmRef}
                cancelRef={modalManagement.modalCancelRef}
            />
        </div>
    );
}