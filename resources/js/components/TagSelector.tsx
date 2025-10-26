import { useState } from "react";
import useNodeTags from "../hooks/useNodeTags";

type TagSelectorProps = {
    nodeId: number | string | undefined;
    refreshAllTags?: () => void; 
};

const diseases = [
    "Diabetes",
    "Hipertensión",
    "Cáncer",
    "Alzheimer",
    "Asma",
    "Epilepsia",
    "Depresión",
    "Artritis",
    "Enfermedad cardíaca",
    "Obesidad",
];

export default function TagSelector({ nodeId, refreshAllTags }: TagSelectorProps) {
    const [selectedDisease, setSelectedDisease] = useState("");
    const { tags, loading, addTag, removeTag } = useNodeTags(nodeId, refreshAllTags);

    const handleAdd = async () => {
        if (!selectedDisease) return;
        await addTag(selectedDisease);
        setSelectedDisease("");
        refreshAllTags?.(); 

    };

    const handleRemove = async (tagId: number) => {
        await removeTag(tagId);
        refreshAllTags?.(); 
    };

    return (
        <div className="border-t-4 border-emerald-600 mt-10 mb-5 rounded-xs p-4">
            <h4 className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-300 tracking-wide uppercase">
                Agregar etiqueta de enfermedad
            </h4>

            {/* Selector y botón */}
            <div className="flex items-center gap-2  mb-6">
                <select
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="text-white bg-gray-800 border border-emerald-600 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="" disabled>
                        Seleccionar enfermedad
                    </option>
                    {diseases.map((disease) => (
                        <option key={disease} value={disease}>
                            {disease}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleAdd}
                    disabled={!selectedDisease || loading}
                    className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? "Cargando..." : "Agregar"}
                </button>
            </div>

            {/* Mostrar tags */}
            <div className="flex flex-col gap-2 mt-4">
                {tags.length === 0 && !loading && (
                    <span className="text-sm text-gray-500 italic">No hay etiquetas aún</span>
                )}

                {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-briefcase-medical-icon lucide-briefcase-medical text-emerald-500"><path d="M12 11v4"/><path d="M14 13h-4"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M18 6v14"/><path d="M6 6v14"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>

                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {tag.tag_value}
                        </span>

                        <button
                            onClick={() => handleRemove(tag.id)}
                            className="ml-5 text-red-300 hover:text-red-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-x cursor-pointer"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
