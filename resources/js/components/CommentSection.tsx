import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import type { SharedData } from "@/types";

interface Comment {
    id: number;
    content: string;
    user?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface CommentSectionProps {
    nodeId: number; 
    initialComments?: Comment[]; 
    onCommentsChange?: (count: number) => void;
}

export default function CommentSection({ nodeId, onCommentsChange }: CommentSectionProps) {
    const { auth } = usePage<SharedData>().props;

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [, setLoading] = useState(true);

    // ---------------------------------------------------------- Cargar comentarios ---
    useEffect(() => {
        if (!nodeId) {
            console.warn("⚠️ No se recibió nodeId válido en CommentSection");
            setComments([]);
            return;
        }

        setLoading(true);
        fetch(`/nodes/${nodeId}/comments`, {
            headers: {
                "Accept": "application/json",
            },
            credentials: "same-origin",
        })
            .then(async (res) => {
                if (!res.ok) {
                    console.warn(`⚠️ Error ${res.status} al cargar comentarios de nodo ${nodeId}`);
                    return [];
                }
                const data = await res.json().catch(() => []);
                return Array.isArray(data) ? data : [];
            })
            .then((data) => setComments(data))
            .catch((err) => {
                console.error("Error cargando comentarios:", err);
                setComments([]);
            })
            .finally(() => setLoading(false));
    }, [nodeId]);


    // --- Cancelar 
    const handleCancel = () => setNewComment("");

    // --- Guardar comentario 
    const handleSave = () => {
        if (!newComment.trim()) return;
        setIsSaving(true);

        fetch(`/nodes/${nodeId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ""
            },
            credentials: "same-origin",
            body: JSON.stringify({ content: newComment }),
        })
            .then((res) => res.json())
            .then((data) => {
                setComments((prev) => [...prev, data]);
                setNewComment("");
            })
            .catch((err) => console.error("Error guardando comentario:", err))
            .finally(() => setIsSaving(false));
    };


    // --------------------------------------------------------------- Eliminar comentario ---
    const handleDeleteComment = async (commentId: number) => {
        try {
            const response = await fetch(`/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ""
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            setComments(prev => prev.filter(c => c.id !== commentId));

        } catch (error) {
            console.error("Error eliminando comentario:", error);
            alert("No se pudo eliminar el comentario.");
        }
    };

    // --------------------------------------------------------------- Editar comentario ---
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleEditComment = async (commentId: number) => {
        if (!editedContent.trim()) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
                },
                credentials: "same-origin",
                body: JSON.stringify({ content: editedContent }),
            });

            if (!response.ok) throw new Error(`Error ${response.status} al actualizar comentario`);
            const updated = await response.json();

            // Actualizar el comentario en la lista
            setComments(prev =>
                prev.map(c => (c.id === commentId ? updated : c))
            );

            setEditingId(null);
            setEditedContent("");
        } catch (error) {
            console.error("❌ Error actualizando comentario:", error);
        } finally {
            setIsUpdating(false);
        }
    };



    useEffect(() => {
        if (onCommentsChange) {
            onCommentsChange(comments.length);
        }
    }, [comments.length, onCommentsChange]);


    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded">
            {/* Textarea para nuevo comentario */}
            <textarea className="w-full rounded p-2 mb-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}/>

            {/* Botones*/}
            <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-white text-emerald-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-emerald-200 dark:hover:bg-gray-600"
                    onClick={handleCancel}>
                    Cancelar
                </button>

                <button className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50"
                    onClick={handleSave} disabled={isSaving || !newComment.trim()}>
                    Guardar
                </button>
            </div>

            {/* Lista de comentarios */}
            <div className="space-y-3">
                {comments.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No hay comentarios aún.</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={comment.id ?? index} className="p-3 rounded-md bg-gray-100 dark:bg-gray-800 relative group">

                            {/* Mini Header con botones */}
                            <div className="flex justify-between items-center">
                                {auth.user?.id === comment.user?.id && (
                                <div className="top-0 right-0  flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">

                                    {/* Boton Editar */}
                                    <button
                                        onClick={() => { setEditingId(comment.id); setEditedContent(comment.content); }}
                                        className="p-1 text-yellow-500 hover:text-yellow-400"
                                        title="Editar comentario">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                            <path d="m15 5 4 4" />
                                        </svg>
                                    </button>

                                    {/* Boton Eliminar */}
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="p-1 text-red-500 hover:text-red-400"
                                        title="Eliminar comentario">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 11v6" />
                                            <path d="M14 11v6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                            <path d="M3 6h18" />
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                
                                </div>
                                )}
                            </div>

                            {editingId === comment.id ? (
                                <div className="space-y-2">
                                    <textarea className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-md border border-gray-300 dark:border-gray-600" rows={2} value={editedContent} onChange={(e) => setEditedContent(e.target.value)}/>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEditComment(comment.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                                            disabled={isUpdating}>
                                            {isUpdating ? "Guardando..." : "Guardar"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditedContent("");
                                            }}
                                            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-900 dark:text-gray-100">{comment.content}</p>
                            )}

                            <div className="mt-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {comment.user?.name || "Usuario desconocido"} – {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
