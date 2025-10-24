import { useState, useEffect } from "react";

export default function useCommentsStatus(nodeId: number | string | undefined) {
    const [hasComments, setHasComments] = useState(false);

    useEffect(() => {
        if (!nodeId) {
            setHasComments(false); 
            return;
        }

        fetch(`/nodes/${nodeId}/comments`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setHasComments(data.length > 0);
                }
            })
            .catch(err => {
                console.error("Error cargando comentarios:", err);
                setHasComments(false);
            });
    }, [nodeId]);

    return { hasComments, setHasComments };
}
