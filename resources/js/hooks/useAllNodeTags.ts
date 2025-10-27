import { useState, useEffect, useCallback } from "react";
import axios from "axios";

type Tag = {
    id: number;
    node_id: number | string;
    tag_value: string;
};

export default function useAllNodeTags(memberIds: (number | string)[], refreshTrigger?: unknown) {
    const [allTags, setAllTags] = useState<Record<number | string, Tag[]>>({});
    const [loading, setLoading] = useState(false);

    const memberIdsString = memberIds.join(',');

    const fetchAllTags = useCallback(async () => {
        if (memberIds.length === 0) return;

        setLoading(true);
        try {
            const requests = memberIds.map(nodeId =>
                axios.get(`/nodes/${nodeId}/tags`)
                    .then(res => [nodeId, res.data])
                    .catch(() => [nodeId, []])
            );

            const results = await Promise.all(requests);
            const tagsByNode = Object.fromEntries(results);
            setAllTags(tagsByNode);
        } catch (error) {
            console.error("Error cargando todas las tags:", error);
        } finally {
            setLoading(false);
        }
    }, [memberIdsString]);

    useEffect(() => {
        fetchAllTags();
    }, [fetchAllTags, refreshTrigger]);

    // Crear illnessMap basado en todas las tags
    const illnessMap: Record<number | string, boolean> = {};
    Object.keys(allTags).forEach(nodeId => {
        illnessMap[nodeId] = allTags[nodeId].length > 0;
    });

    return { illnessMap, loading, refetch: fetchAllTags };
}
