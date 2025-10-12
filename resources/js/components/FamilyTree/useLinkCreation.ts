import { useState } from 'react';
import * as go from 'gojs';
import { FamilyMember } from './useFamilyMemberManagement';
// Hook para gestionar la creación de enlaces (relaciones) entre miembros de forma dinamica.
export function useLinkCreation(
    members: FamilyMember[], 
    onDataChange?: (members: FamilyMember[]) => void
) {
    const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
    const [linkCreationData, setLinkCreationData] = useState<{
        from: number | string;
        to: number | string;
        link: go.Link | null;
    } | null>(null);

    // Handle link creation start (for dynamic linking)
    const handleLinkCreationStart = (fromKey: number | string, toKey: number | string, link?: go.Link | null) => {
        setLinkCreationData({
            from: fromKey,
            to: toKey,
            link: link || null
        });
        setShowLinkModal(true);
    };

    // Create relationship between members
    const createRelationship = (relationshipType: 'spouse' | 'parent-child', direction?: 'from-to' | 'to-from') => {
        if (!linkCreationData) return;

        const { from, to } = linkCreationData;
        let updatedMembers = [...members];

        if (relationshipType === 'spouse') {
            // Add spouse relationship (bidirectional)
            updatedMembers = updatedMembers.map(member => {
                if (member.key === from) {
                    return { ...member, spouses: [...(member.spouses || []), to] };
                } else if (member.key === to) {
                    return { ...member, spouses: [...(member.spouses || []), from] };
                }
                return member;
            });
        } else if (relationshipType === 'parent-child') {
            if (direction === 'from-to') {
                // from is parent of to
                updatedMembers = updatedMembers.map(member => {
                    if (member.key === to) {
                        return { ...member, parents: [...(member.parents || []), from] };
                    }
                    return member;
                });
            } else if (direction === 'to-from') {
                // to is parent of from
                updatedMembers = updatedMembers.map(member => {
                    if (member.key === from) {
                        return { ...member, parents: [...(member.parents || []), to] };
                    }
                    return member;
                });
            }
        }

        onDataChange?.(updatedMembers);
        setShowLinkModal(false);
        setLinkCreationData(null);
    };

    // Cancel link creation
    const cancelLinkCreation = () => {
        // Remove the link from diagram if it exists
        if (linkCreationData?.link) {
            const diagram = linkCreationData.link.diagram;
            if (diagram) {
                diagram.remove(linkCreationData.link);
            }
        }
        setShowLinkModal(false);
        setLinkCreationData(null);
    };

    return {
        showLinkModal,
        setShowLinkModal,
        linkCreationData,
        setLinkCreationData,
        handleLinkCreationStart,
        createRelationship,
        cancelLinkCreation
    };
}