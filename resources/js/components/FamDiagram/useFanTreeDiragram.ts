import { useEffect } from "react";
import * as go from "gojs";
import {
    RadialLayoutCustom,
    makeAnnularWedge,
    computeTextAlignment,
    ensureUpright,
    layerThickness,
} from "./FanTreeLayout";
interface NodeData {
    key: string;
    name?: string;
    img?: string;
    gender?: string;
    birth_date?: string;
    death_date?: string;
    category?: string;
    node_data?: string;
}

interface LinkData {
    from: string;
    to: string;
    relationship: string;
}
export function useFanTreeDiagram(ref: React.RefObject<HTMLDivElement | null>, arbolId: number) {
    useEffect(() => {
        if (!ref.current) return;

        const $ = go.GraphObject.make;

        const diagram = $(go.Diagram, ref.current, {
            initialAutoScale: go.Diagram.Uniform,
            isReadOnly: true,
            maxSelectionCount: 1,
            layout: $(RadialLayoutCustom, {
                layerThickness: 70,
                isOngoing: false,
                isInitial: false,
            }),
            "animationManager.isEnabled": false,
            initialContentAlignment: go.Spot.Center,
            
        });

        // Funcion para formatear fechas en formato DD/MM/YYYY
        // function formatDate(dateString: string): string {
        //     if (!dateString) return "";
        //     try {
        //         const date = new Date(dateString);
        //         return date.toLocaleDateString('es-ES', {
        //             year: 'numeric',
        //             month: '2-digit',
        //             day: '2-digit'
        //         });
        //     } catch {
        //         return dateString;
        //     }
        // }

        diagram.addDiagramListener("LayoutCompleted", (_e) => {
            diagram.links.each(link => {
                if (link.category === "spouse" || link.category === "parent") {
                    const n1 = link.fromNode;
                    const n2 = link.toNode;

                    if (!n1 || !n2) return;

                    const d1 = n1.data;
                    const d2 = n2.data;

                    d2.radius = d1.radius;
                    d2.angle = d1.angle + ((d1.sweep ?? 10) / 4);

                    const pt = new go.Point(d2.radius, 0).rotate(d2.angle);
                    n2.location = pt;
                }
            });
        });
        const toolTip = $(
            "ToolTip",
            $(go.Panel, "Vertical", { margin: 5 },
                $(go.TextBlock, { margin: 4, font: "bold 12pt sans-serif" },
                    new go.Binding("text"))
            )
        );

        //-------------------------------------------- Template para nodos normales
        diagram.nodeTemplate = $(
            go.Node, "Spot",
            {
                locationSpot: go.Spot.Center,
                selectionAdorned: false,
                toolTip,
            },
            $(go.Shape,
                {
                    fill: "lightgray",
                    strokeWidth: 1.5,
                    stroke: "#666"
                },
                new go.Binding("geometry", "", makeAnnularWedge),
                new go.Binding("fill", "color")
            ),
            $(go.Panel, "Vertical",
                {
                    width: layerThickness * 0.9,
                    alignment: go.Spot.Center,
                    alignmentFocus: go.Spot.Center
                },
                new go.Binding("alignment", "", computeTextAlignment),
                new go.Binding("angle", "angle", ensureUpright),

                // Nombre
                $(go.TextBlock,
                    {
                        textAlign: "center",
                        font: "bold 13px sans-serif",
                        stroke: "#333",
                        wrap: go.TextBlock.WrapFit,
                        maxLines: 2,
                        margin: new go.Margin(1, 0, 0, 0)
                    },
                    new go.Binding("text", "name")
                ),

                // Fecha de nacimiento
                $(go.TextBlock,
                    {
                        textAlign: "center",
                        font: "9px sans-serif",
                        stroke: "#000000",
                        margin: new go.Margin(1, 0, 0, 0)
                    },
                    new go.Binding("text", "birth_date", function (birth) {
                        return birth ? `❤️${birth}` : "";
                    })
                ),

                // Fecha de defuncion
                $(go.TextBlock,
                    {
                        textAlign: "center",
                        font: "9px sans-serif",
                        stroke: "#000000",
                        margin: new go.Margin(0, 0, 1, 0)
                    },
                    new go.Binding("text", "death_date", function (death) {
                        return death ? `⚰️${death}` : "";
                    })
                )
            )
        );

        //-------------------------------------------- Template para nodo raiz
        diagram.nodeTemplateMap.add(
            "Root",
            $(
                go.Node, "Auto",
                {
                    locationSpot: go.Spot.Center,
                    selectionAdorned: false,
                    toolTip,
                    width: layerThickness * 2,
                    height: layerThickness * 2,
                },
                $(go.Shape, "Circle", {
                    fill: "#4CAF50",
                    strokeWidth: 2,
                    stroke: "#2E7D32",
                }),
                $(go.Panel, "Vertical",
                    { margin: 6 },
                    $(go.TextBlock,
                        {
                            font: "bold 15px sans-serif",
                            textAlign: "center",
                            stroke: "white",
                            wrap: go.Wrap.Fit,
                            width: layerThickness * 1.2,
                        },
                        new go.Binding("text", "name")
                    ),
                    // Fecha de nacimiento
                    $(go.TextBlock,
                        {
                            textAlign: "center",
                            font: "9px sans-serif",
                            stroke: "#000000",
                            margin: new go.Margin(1, 0, 0, 0)
                        },
                        new go.Binding("text", "birth_date", function (birth) {
                            return birth ? `❤️${birth}` : "";
                        })
                    ),

                    // Fecha de defuncion
                    $(go.TextBlock,
                        {
                            textAlign: "center",
                            font: "9px sans-serif",
                            stroke: "#000000",
                            margin: new go.Margin(0, 0, 1, 0)
                        },
                        new go.Binding("text", "death_date", function (death) {
                            return death ? `⚰️${death}` : "";
                        })
                    )
                )
            )
        );


        diagram.linkTemplate = $(
            go.Link,
            {
                routing: go.Link.Normal,
                curve: go.Link.JumpOver,
                selectable: false
            },
            $(go.Shape, { strokeWidth: 1.5, stroke: "#999" })
        );

        // Cargar datos
        fetch(`/arboles/api/${arbolId}/data`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Datos recibidos:", data);

                const nodeDataArray = (data.nodes || []).map((n: NodeData) => {
                    const nodeData = {
                        key: n.key,
                        name: n.name || `Nodo ${n.key}`,
                        img: n.img,
                        gender: n.gender,
                        birth_date: n.birth_date,
                        death_date: n.death_date,
                        category: n.category || "Normal",
                        ...(n.node_data ? JSON.parse(n.node_data) : {}),
                    };

                    if (nodeData.gender === 'M') nodeData.color = "#90CAF9";
                    else if (nodeData.gender === 'F') nodeData.color = "#F48FB1";
                    else if (nodeData.category === 'Root') nodeData.color = "#4CAF50";
                    else nodeData.color = "#E0E0E0";

                    return nodeData;
                });

                const linkDataArray = (data.links || []).map((l: LinkData) => ({
                    from: l.from,
                    to: l.to,
                    category: l.relationship,
                }));

                console.log("Nodos procesados:", nodeDataArray);
                console.log("Enlaces procesados:", linkDataArray);

                let rootNode = nodeDataArray.find(
                    (n: NodeData) => !linkDataArray.some((l: LinkData) => l.to === n.key)
                );

                if (rootNode) {
                    rootNode.category = "Root";
                    console.log("Nodo raíz identificado:", rootNode);
                }

                diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

                diagram.updateAllTargetBindings();
                diagram.layoutDiagram(true);
                diagram.zoomToFit();
            })
            .catch((err) => console.error("Error cargando árbol:", err));

        return () => {
            if (diagram) {
                diagram.clear();
            }
        };
    }, [arbolId, ref]);
}