import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TreeOverview from "@/components/TreeOverview";
import FanTreeOverview from "@/components/FamDiagram/FanTreeOverview"; 
import { useState } from "react";

interface ExportModalProps {
    open: boolean
    onClose: () => void
    arbolId: number
}

export default function ExportModal({ arbolId, open, onClose }: ExportModalProps) {
    const [viewMode, setViewMode] = useState<"clasico" | "abanico">("clasico");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Exportar árbol</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex gap-2">
                        <div className="relative group">
                            <Button
                                variant={viewMode === "clasico" ? "default" : "outline"}
                                onClick={() => setViewMode("clasico")}>
                                Árbol clásico
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 text-sm">
                                <p>Vista tradicional en forma de árbol que crece verticalmente. Ideal para ver líneas familiares completas y relaciones.</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Button
                                variant={viewMode === "abanico" ? "default" : "outline"}
                                onClick={() => setViewMode("abanico")}>
                                Árbol radial
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 text-sm">
                                <p> Vista circular donde las generaciones se organizan en anillos concéntricos. Perfecto para visualizar relaciones complejas de forma compacta.</p>
                            </div>
                        </div>
                    </div>

                    <div className=" w-full border rounded-lg flex items-center justify-center text-muted-foreground  bg-gray-50 dark:bg-gray-800">
                        {viewMode === "clasico" ? (
                            <TreeOverview arbolId={arbolId} height="300px" />
                        ) : (
                            <FanTreeOverview arbolId={arbolId} />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button>Descargar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
