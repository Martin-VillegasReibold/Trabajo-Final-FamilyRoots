import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TreeOverview from "@/components/TreeOverview";
import FanTreeOverview from "@/components/FamDiagram/FanTreeOverview";
import { useRef, useState } from "react";
import * as go from "gojs";
import { jsPDF } from "jspdf";

interface ExportModalProps {
    open: boolean
    onClose: () => void
    arbolId: number
    arbolName?: string
}

export default function ExportModal({ arbolId, open, onClose, arbolName }: ExportModalProps) {
    const [viewMode, setViewMode] = useState<"clasico" | "abanico">("clasico");
    const [format, setFormat] = useState<"pdf" | "png" | "jpg" | "svg">("pdf");
    const [downloading, setDownloading] = useState(false);
    const classicDiagramRef = useRef<go.Diagram | null>(null);
    const radialDiagramRef = useRef<go.Diagram | null>(null);

    // no local interfaces needed; we reuse overview diagrams

    function makeFileBase(): string {
        const base = (arbolName || 'arbol').toString();
        const noAccents = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cleaned = noAccents.replace(/[^a-zA-Z0-9-_ ]+/g, '').trim();
        return cleaned.replace(/\s+/g, '_').toLowerCase();
    }

    function savePdf(diagram: go.Diagram, filename: string) {
        const db = diagram.documentBounds;
        const img = diagram.makeImageData({ position: new go.Point(db.x, db.y), size: new go.Size(db.width, db.height), scale: 1, background: "white" }) as string;
        const landscape = db.width >= db.height;
        const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const scale = Math.min(pageW / db.width, pageH / db.height);
        const drawW = db.width * scale;
        const drawH = db.height * scale;
        const offsetX = (pageW - drawW) / 2;
        const offsetY = (pageH - drawH) / 2;
        const image = new Image();
        image.onload = () => { pdf.addImage(image, 'PNG', offsetX, offsetY, drawW, drawH); pdf.save(filename); };
        image.src = img;
    }

    function downloadDataUrl(filename: string, dataUrl: string) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function saveRaster(diagram: go.Diagram, filename: string, type: "image/png" | "image/jpeg") {
        const db = diagram.documentBounds;
        const dataUrl = diagram.makeImageData({
            position: new go.Point(db.x, db.y),
            size: new go.Size(db.width, db.height),
            scale: 1,
            background: "white",
            type
        }) as string;
        downloadDataUrl(filename, dataUrl);
    }

    function saveSvg(diagram: go.Diagram, filename: string) {
        const db = diagram.documentBounds;
        const svg = diagram.makeSvg({
            position: new go.Point(db.x, db.y),
            size: new go.Size(db.width, db.height),
            scale: 1,
            background: "white"
        }) as SVGElement;
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function onDownload() {
        const diagram = viewMode === 'clasico' ? classicDiagramRef.current : radialDiagramRef.current;
        if (!diagram) return;
        try {
            setDownloading(true);
            const base = makeFileBase();
            if (format === 'pdf') {
                savePdf(diagram, `${base}_${viewMode}.pdf`);
            } else if (format === 'png') {
                saveRaster(diagram, `${base}_${viewMode}.png`, 'image/png');
            } else if (format === 'jpg') {
                saveRaster(diagram, `${base}_${viewMode}.jpg`, 'image/jpeg');
            } else if (format === 'svg') {
                saveSvg(diagram, `${base}_${viewMode}.svg`);
            }
        } finally {
            setDownloading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Exportar árbol</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Elige el formato y la vista para exportar tu árbol genealógico. Puedes descargarlo como PDF, PNG, JPG o SVG en modo clásico o radial.
                </DialogDescription>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex gap-2">
                        <div className="relative group">
                            <Button
                                variant={viewMode === "clasico" ? "default" : "outline"}
                                onClick={() => setViewMode("clasico")} className="cursor-pointer">
                                Árbol clásico
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 text-sm">
                                <p>Vista tradicional en forma de árbol que crece verticalmente. Ideal para ver líneas familiares completas y relaciones.</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Button
                                variant={viewMode === "abanico" ? "default" : "outline"}
                                onClick={() => setViewMode("abanico")} className="cursor-pointer">
                                Árbol radial
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 text-sm">
                                <p> Vista circular donde las generaciones se organizan en anillos concéntricos. Perfecto para visualizar relaciones complejas de forma compacta.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Button variant={format === 'pdf' ? 'default' : 'outline'} onClick={() => setFormat('pdf')} className="cursor-pointer">PDF</Button>
                        <Button variant={format === 'png' ? 'default' : 'outline'} onClick={() => setFormat('png')} className="cursor-pointer">PNG</Button>
                        <Button variant={format === 'jpg' ? 'default' : 'outline'} onClick={() => setFormat('jpg')} className="cursor-pointer">JPG</Button>
                        <Button variant={format === 'svg' ? 'default' : 'outline'} onClick={() => setFormat('svg')} className="cursor-pointer">SVG</Button>
                    </div>

                    <div className=" w-full border rounded-lg flex items-center justify-center text-muted-foreground  bg-gray-50 dark:bg-gray-800">
                        {viewMode === "clasico" ? (
                            <TreeOverview arbolId={arbolId} height="300px" onReady={(d) => { classicDiagramRef.current = d; }} />
                        ) : (
                            <FanTreeOverview arbolId={arbolId} onReady={(d) => { radialDiagramRef.current = d; }} />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="secondary" className="cursor-pointer">Cancelar</Button>
                    <Button onClick={onDownload} disabled={downloading || (viewMode === 'clasico' ? !classicDiagramRef.current : !radialDiagramRef.current)} className="cursor-pointer">
                        {downloading ? "Descargando..." : "Descargar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
