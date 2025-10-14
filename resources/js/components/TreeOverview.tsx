import * as go from "gojs";
import { useEffect, useRef } from "react";

interface TreeOverviewProps {
    arbolId: number;
}

export default function TreeOverview({ arbolId }: TreeOverviewProps) {
    const diagramRef = useRef<HTMLDivElement>(null);
    const overviewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!diagramRef.current || !overviewRef.current) return;

        const diagram = new go.Diagram(diagramRef.current, {
            "undoManager.isEnabled": false,
            allowDelete: false,
            allowCopy: false,
            allowInsert: false,
            allowMove: false,
            allowZoom: false,
            allowHorizontalScroll: false,
            allowVerticalScroll: false,
            initialAutoScale: go.Diagram.Uniform,
            initialContentAlignment: go.Spot.Center,
             layout: new go.TreeLayout({ angle: 90, layerSpacing: 30 }), // 🔹 árbol descendente
        });

        // Definir plantilla de nodos
        diagram.nodeTemplate = new go.Node("Auto")
            .add(
                new go.Shape("RoundedRectangle", {
                    fill: "lightgray",
                    strokeWidth: 0,
                }),
                new go.TextBlock({
                    margin: 5,
                    font: "bold 10px sans-serif",
                    wrap: go.TextBlock.WrapFit,
                    maxLines: 2
                }).bind("text", "name")
            );

        // Definir plantilla de enlaces
        diagram.linkTemplate = new go.Link({
            selectable: false,
            routing: go.Link.Orthogonal,
            corner: 5,
        }).add(new go.Shape({ strokeWidth: 1, stroke: "#555" }));

        // Crear Overview (mini mapa)
        const overview = new go.Overview(overviewRef.current);
        overview.observed = diagram;
        
        overview.box = go.GraphObject.make(go.Part,
            {
                layerName: "Grid",
                selectable: false
            },
            go.GraphObject.make(go.Shape,
                {
                    name: "BOX",
                    figure: "Rectangle",
                    fill: null,
                    stroke: "transparent",
                    strokeWidth: 0
                }
            )
        );
        // Cargar datos del arbol
        fetch(`/arboles/api/${arbolId}/data`)
            .then((res) => res.json())
            .then((data) => {
                diagram.model = new go.GraphLinksModel(data.nodes, data.links);
            })
            .catch((err) => console.error("Error cargando datos del árbol:", err));

        return () => {
            diagram.div = null;
            overview.div = null;
        };
    }, [arbolId]);

    return (
        <div className="w-full flex flex-col items-center">
            <div
                ref={diagramRef}
                style={{
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    position: "absolute",
                    left: "-1000px"
                }}
            ></div>

            {/* Vista general */}
            <div
                ref={overviewRef}
                style={{

                    width: "100%",
                    height: "150px",
                    borderRadius: "5px",
                    backgroundColor: "white",
                }}
            ></div>
        </div>
    );
}