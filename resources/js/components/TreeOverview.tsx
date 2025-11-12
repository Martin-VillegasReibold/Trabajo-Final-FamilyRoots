import * as go from "gojs";
import { useEffect, useRef } from "react";
import { buildModel } from "./FamilyTree/useDiagramManagement";

interface TreeOverviewProps {
    arbolId: number;
    height?: string; 
}

export default function TreeOverview({ arbolId, height }: TreeOverviewProps) {
    const diagramRef = useRef<HTMLDivElement>(null);
    const overviewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!diagramRef.current || !overviewRef.current) return;

        const $ = go.GraphObject.make;
        const diagram = $(go.Diagram, diagramRef.current, {
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
            layout: $(go.LayeredDigraphLayout, {
                direction: 90,
                layerSpacing: 80,
                columnSpacing: 60,
                setsPortSpots: false,
                cycleRemoveOption: go.LayeredDigraphLayout.CycleDepthFirst,
                aggressiveOption: go.LayeredDigraphLayout.AggressiveLess,
                isInitial: true,
                isOngoing: false
            })
        });

        diagram.nodeTemplate = $(
            go.Node,
            'Auto',
            {
                selectionAdorned: false,
                resizable: false,
                locationSpot: go.Spot.Center,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                fromLinkable: false,
                toLinkable: false,
                movable: false,
                dragComputation: (node, pt, gridpt) => gridpt
            },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle', {
                strokeWidth: 2,
                stroke: '#E6F4EA',
                portId: '',
                cursor: 'pointer',
                width: 140,
                height: 100,
                fromLinkable: false,
                toLinkable: false
            },
                new go.Binding('fill', '', (data) => {
                    if (data.isMarriageNode) {
                        return '#FEF3C7';
                    }
                    switch (data.gender) {
                        case 'M': return '#E3F2FD';
                        case 'F': return '#FCE4EC';
                        default: return '#F3E5F5';
                    }
                }),
                new go.Binding('stroke', '', (data) => data.isMarriageNode ? '#F59E0B' : '#E6F4EA'),
                new go.Binding('strokeWidth', '', (data) => data.isMarriageNode ? 3 : 2),
                new go.Binding('figure', '', (data) => data.isMarriageNode ? 'Circle' : 'RoundedRectangle'),
                new go.Binding('width', '', (data) => data.isMarriageNode ? 35 : 140),
                new go.Binding('height', '', (data) => data.isMarriageNode ? 35 : 100)),
            $(go.Panel, 'Vertical', { margin: 6 },
                $(go.Picture, {
                    name: 'PICTURE',
                    desiredSize: new go.Size(50, 50),
                    margin: new go.Margin(0, 0, 3, 0),
                    imageStretch: go.GraphObject.UniformToFill,
                },
                    new go.Binding('source', 'img'),
                    new go.Binding('visible', '', (data) => !data.isMarriageNode)),
                $(go.TextBlock, {
                    font: '600 11px Inter, system-ui, -apple-system, "Segoe UI", Roboto',
                    stroke: '#064E3B',
                    textAlign: 'center',
                    maxSize: new go.Size(130, NaN),
                    wrap: go.TextBlock.WrapFit,
                    margin: new go.Margin(0, 0, 1, 0)
                },
                    new go.Binding('text', 'name'),
                    new go.Binding('font', '', (data) => data.isMarriageNode ? '14px serif' : '600 11px Inter'),
                    new go.Binding('stroke', '', (data) => data.isMarriageNode ? '#F59E0B' : '#064E3B'),
                    new go.Binding('margin', '', (data) => data.isMarriageNode ? new go.Margin(0) : new go.Margin(0, 0, 1, 0))),
                $(go.TextBlock, {
                    font: '9px Inter, system-ui',
                    stroke: '#6B7280',
                    textAlign: 'center',
                    maxSize: new go.Size(130, NaN)
                },
                    new go.Binding('text', '', (data) => {
                        if (data.isMarriageNode) return '';
                        let years = '';
                        if (data.birthYear) {
                            years = data.birthYear.toString();
                            if (data.deathYear) {
                                years += ` - ${data.deathYear}`;
                            }
                        }
                        return years;
                    }),
                    new go.Binding('visible', '', (data) => !data.isMarriageNode))
            )
        );

        diagram.linkTemplateMap.add('',
            $(go.Link, {
                routing: go.Link.Orthogonal,
                corner: 5,
                toShortLength: 4,
                relinkableFrom: false,
                relinkableTo: false
            },
                $(go.Shape, { stroke: '#9AE6B4', strokeWidth: 2 }),
                $(go.Shape, { toArrow: 'Standard', fill: '#9AE6B4', stroke: null, scale: 1.2 })
            )
        );

        diagram.linkTemplateMap.add('marriage',
            $(go.Link, {
                routing: go.Link.Normal,
                curve: go.Link.None,
                selectable: false,
                pickable: false
            },
                $(go.Shape, {
                    stroke: '#F59E0B',
                    strokeWidth: 2,
                    opacity: 0.7
                })
            )
        );

        // Cargar datos del arbol y aplicar buildModel
        fetch(`/arboles/api/${arbolId}/data`)
            .then((res) => res.json())
            .then((data) => {
                const { nodeDataArray, linkDataArray } = buildModel(data.nodes, {});
                diagram.model = $(go.GraphLinksModel, { nodeDataArray, linkDataArray });
            })
            .catch((err) => console.error("Error cargando datos del árbol:", err));

        // Posicionar nodos de matrimonio igual que en el árbol principal
        const positionMarriageNodes = () => {
            diagram.startTransaction('position marriage nodes');
            const marriageNodeData: Array<{ node: go.Node; spouse1: go.Node; spouse2: go.Node }> = [];
            diagram.nodes.each((node) => {
                const data = node.data;
                if (data && data.isMarriageNode && data.spouseKeys && data.spouseKeys.length === 2) {
                    const spouse1 = diagram.findNodeForKey(data.spouseKeys[0]);
                    const spouse2 = diagram.findNodeForKey(data.spouseKeys[1]);
                    if (spouse1 && spouse2) {
                        marriageNodeData.push({ node, spouse1, spouse2 });
                    }
                }
            });
            marriageNodeData.forEach(({ node, spouse1, spouse2 }) => {
                const pos1 = spouse1.location;
                const pos2 = spouse2.location;
                const centerX = (pos1.x + pos2.x) / 2;
                const centerY = (pos1.y + pos2.y) / 2;
                const spouseDistance = 100;
                const leftSpouse = pos1.x < pos2.x ? spouse1 : spouse2;
                const rightSpouse = pos1.x < pos2.x ? spouse2 : spouse1;
                leftSpouse.location = new go.Point(centerX - spouseDistance, centerY);
                rightSpouse.location = new go.Point(centerX + spouseDistance, centerY);
                node.location = new go.Point(centerX, centerY);
            });
            diagram.commitTransaction('position marriage nodes');
        };
        let isInitialLayout = true;
        diagram.addDiagramListener('InitialLayoutCompleted', () => {
            setTimeout(() => {
                positionMarriageNodes();
                isInitialLayout = false;
            }, 100);
        });
        diagram.addDiagramListener('LayoutCompleted', () => {
            if (isInitialLayout) {
                setTimeout(positionMarriageNodes, 100);
            }
        });

        const overview = $(go.Overview, overviewRef.current);
        overview.observed = diagram;
        overview.box = $(go.Part,
            { layerName: "Grid", selectable: false },
            $(go.Shape, {
                name: "BOX",
                figure: "Rectangle",
                fill: null,
                stroke: "transparent",
                strokeWidth: 0
            })
        );

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
            <div
                ref={overviewRef}
                className="w-full h-[150px] rounded-[5px] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
                style={{
                    // fallback for environments without Tailwind
                    width: "100%",
                    height: height || "150px",
                    borderRadius: "5px",
                }}
            ></div>
        </div>
    );
}