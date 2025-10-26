import { useState, useEffect } from "react";
import axios from "axios";

type Tag = {
    id: number;
    node_id: number | string; 
    tag_value: string;
};

export default function useNodeTags(nodeId: number | string | undefined,onTagsChange?: (tags: Tag[]) => void ) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

   // cargar etiquetas del nodo
    const fetchTags = async () => {
        if (!nodeId) return;
        setLoading(true);
        try {
            const response = await axios.get(`/nodes/${nodeId}/tags`);
            setTags(response.data);
            onTagsChange?.(response.data); 
        } catch (error) {
            console.error("Error al cargar tags:", error);
        } finally {
            setLoading(false);
        }
    };


   // agregar nueva etiqueta
    const addTag = async (tagValue: string) => {
        try {
            const response = await axios.post("/nodes/tags", {
                node_id: nodeId,
                tag_value: tagValue,
            });
            const newTags = [...tags, response.data.tag];
            setTags(newTags);
            onTagsChange?.(newTags); 
        } catch (error) {
            console.error("Error al agregar tag:", error);
        }
    };

     // eliminar etiqueta
    const removeTag = async (tagId: number) => {
        try {
            await axios.delete(`/nodes/tags/${tagId}`);
            const newTags = tags.filter((t) => t.id !== tagId);
            setTags(newTags);
            onTagsChange?.(newTags); 
        } catch (error) {
            console.error("Error al eliminar tag:", error);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [nodeId]);

    
    return { tags, loading, addTag, removeTag, fetchTags };
}
