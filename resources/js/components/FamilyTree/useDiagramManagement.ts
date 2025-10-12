import { useEffect, useRef, useCallback } from 'react';
import * as go from 'gojs';
import { FamilyMember } from './useFamilyMemberManagement';
// Hook para gestionar el diagrama de GoJS, incluyendo su inicialización, actualización y 
// funciones de la barra de herramientas.
export function useDiagramManagement(
    members: FamilyMember[],
    setSelected: (member: FamilyMember | null) => void,
    handleLinkCreationStart: (from: number | string, to: number | string, link?: go.Link | null) => void
) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const diagramRef = useRef<go.Diagram | null>(null);
    
    // Use refs to avoid re-initializing diagram when these functions change
    const setSelectedRef = useRef(setSelected);
    const handleLinkCreationStartRef = useRef(handleLinkCreationStart);
    
    // Update refs when functions change
    useEffect(() => {
        setSelectedRef.current = setSelected;
        handleLinkCreationStartRef.current = handleLinkCreationStart;
    }, [setSelected, handleLinkCreationStart]);

    const buildModel = useCallback((data: FamilyMember[]) => {
        const nodeDataArray: FamilyMember[] = [];
        const linkDataArray: Array<{ from: number | string; to: number | string; category?: string }> = [];
        
        // Add all family members as nodes
        data.forEach((member) => {
            nodeDataArray.push({
                key: member.key,
                name: member.name,
                gender: member.gender || 'Other',
                birthYear: member.birthYear,
                deathYear: member.deathYear,
                img: member.img || '/imagenes/logo Arbol.png',
                spouses: member.spouses || [],
                parents: member.parents || [],
                isMarriageNode: false
            });
        });

        // Create marriage nodes and links for couples
        const marriageNodes = new Map<string, FamilyMember>();
        const processedMarriages = new Set<string>();
        
        data.forEach(member => {
            if (member.spouses && member.spouses.length > 0) {
                member.spouses.forEach(spouseKey => {
                    // Create a unique key for this marriage (sorted to avoid duplicates)
                    const marriageKey = [member.key, spouseKey].sort().join('-');
                    
                    if (!processedMarriages.has(marriageKey)) {
                        processedMarriages.add(marriageKey);
                        
                        // Create marriage node
                        const marriageNodeKey = `marriage-${marriageKey}`;
                        const marriageNode: FamilyMember = {
                            key: marriageNodeKey,
                            name: '♥',
                            isMarriageNode: true,
                            spouseKeys: [member.key, spouseKey]
                        };
                        marriageNodes.set(marriageKey, marriageNode);
                        
                        nodeDataArray.push(marriageNode);
                        
                        // Create links from spouses to marriage node
                        linkDataArray.push({ 
                            from: member.key, 
                            to: marriageNodeKey, 
                            category: 'marriage' 
                        });
                        linkDataArray.push({ 
                            from: spouseKey, 
                            to: marriageNodeKey, 
                            category: 'marriage' 
                        });
                    }
                });
            }
        });

        // Create parent-child links
        data.forEach(member => {
            if (member.parents && member.parents.length > 0) {
                // Check if both parents exist and have a marriage relationship
                if (member.parents.length === 2) {
                    const [parent1, parent2] = member.parents;
                    const marriageKey = [parent1, parent2].sort().join('-');
                    const marriageNode = marriageNodes.get(marriageKey);
                    
                    if (marriageNode) {
                        // Link from marriage node to child
                        linkDataArray.push({ 
                            from: marriageNode.key, 
                            to: member.key, 
                            category: 'parent' 
                        });
                    } else {
                        // No marriage relationship, link from both parents individually
                        member.parents.forEach(parentKey => {
                            linkDataArray.push({ 
                                from: parentKey, 
                                to: member.key, 
                                category: 'parent' 
                            });
                        });
                    }
                } else {
                    // Single parent
                    member.parents.forEach(parentKey => {
                        linkDataArray.push({ 
                            from: parentKey, 
                            to: member.key, 
                            category: 'parent' 
                        });
                    });
                }
            }
        });

        return { nodeDataArray, linkDataArray };
    }, []);

    // Initialize diagram (only once)
    useEffect(() => {
        const $ = go.GraphObject.make;
        if (!divRef.current || diagramRef.current) return;

        const diagram = $(go.Diagram, divRef.current, {
            'undoManager.isEnabled': true,
            
            // Enable node movement
            allowMove: true,
            allowCopy: false,
            allowDelete: false,
            
            layout: $(go.LayeredDigraphLayout, {
                direction: 90,
                layerSpacing: 80,
                columnSpacing: 60,
                setsPortSpots: false,
                cycleRemoveOption: go.LayeredDigraphLayout.CycleDepthFirst,
                aggressiveOption: go.LayeredDigraphLayout.AggressiveLess,
                // Allow manual positioning to override layout
                isInitial: true,
                isOngoing: false
            }),
            initialAutoScale: go.Diagram.Uniform,
            'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
            'animationManager.isEnabled': false,
            
            // Enable dynamic linking
            'linkingTool.isEnabled': true,
            'linkingTool.portGravity': 20,
            'linkingTool.archetypeLinkData': { category: 'new' },
            'relinkingTool.isEnabled': true,
            
            // Enable dragging tool for moving nodes
            'draggingTool.isEnabled': true,
            'draggingTool.dragsTree': false
        });

        // Configure linking tool properties
        diagram.toolManager.linkingTool.direction = go.LinkingTool.ForwardsOnly;
        
        // Only allow linking when Shift key is pressed
        diagram.toolManager.linkingTool.canStart = function() {
            if (!go.LinkingTool.prototype.canStart.call(this)) return false;
            const e = this.diagram.lastInput;
            return e && e.shift;
        };

        // Define node template for family members
        diagram.nodeTemplate = $(
            go.Node,
            'Auto',
            { 
                selectionAdorned: true,
                resizable: false,
                locationSpot: go.Spot.Center,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                fromLinkable: true,
                toLinkable: true,
                movable: true,  // Explicitly enable movement
                dragComputation: (node, pt, gridpt) => {
                    // Allow free movement
                    return gridpt;
                }
            },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle', {
                strokeWidth: 2,
                stroke: '#E6F4EA',
                portId: '',
                cursor: 'pointer',
                width: 140,
                height: 100,
                fromLinkable: true,
                toLinkable: true
            },
            new go.Binding('fill', '', (data) => {
                if (data.isMarriageNode) {
                    return '#FEF3C7'; // Light yellow for marriage nodes
                }
                switch (data.gender) {
                    case 'M': return '#E3F2FD'; // Light blue for male
                    case 'F': return '#FCE4EC'; // Light pink for female
                    default: return '#F3E5F5'; // Light purple for other
                }
            }),
            new go.Binding('stroke', '', (data) => data.isMarriageNode ? '#F59E0B' : '#E6F4EA'),
            new go.Binding('strokeWidth', '', (data) => data.isMarriageNode ? 3 : 2),
            new go.Binding('figure', '', (data) => data.isMarriageNode ? 'Circle' : 'RoundedRectangle'),
            new go.Binding('width', '', (data) => data.isMarriageNode ? 35 : 140),  // Marriage nodes back to original size
            new go.Binding('height', '', (data) => data.isMarriageNode ? 35 : 100)), // Marriage nodes back to original size
            $(go.Panel, 'Vertical', { margin: 6 },
                $(go.Picture, {
                    name: 'PICTURE',
                    desiredSize: new go.Size(50, 50),  // Slightly smaller image for better proportions
                    margin: new go.Margin(0, 0, 3, 0),
                    imageStretch: go.GraphObject.UniformToFill,
                }, 
                new go.Binding('source', 'img'),
                new go.Binding('alt', 'name'),
                new go.Binding('visible', '', (data) => !data.isMarriageNode)),
                $(go.TextBlock, {
                    font: '600 11px Inter, system-ui, -apple-system, "Segoe UI", Roboto',  // Slightly smaller font
                    stroke: '#064E3B',
                    textAlign: 'center',
                    maxSize: new go.Size(130, NaN),  // Adjusted max width
                    wrap: go.TextBlock.WrapFit,
                    margin: new go.Margin(0, 0, 1, 0)  // Reduced margin
                }, 
                new go.Binding('text', 'name'),
                new go.Binding('font', '', (data) => data.isMarriageNode ? '14px serif' : '600 11px Inter'),  // Adjusted font sizes
                new go.Binding('stroke', '', (data) => data.isMarriageNode ? '#F59E0B' : '#064E3B'),
                new go.Binding('margin', '', (data) => data.isMarriageNode ? new go.Margin(0) : new go.Margin(0, 0, 1, 0))),
                $(go.TextBlock, {
                    font: '9px Inter, system-ui',  // Slightly smaller font
                    stroke: '#6B7280',
                    textAlign: 'center',
                    maxSize: new go.Size(130, NaN)  // Adjusted max width
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

        // Define different link templates for different relationships
        diagram.linkTemplateMap.add('', // Default template for parent-child relationships
            $(go.Link, {
                routing: go.Link.Orthogonal,
                corner: 5,
                toShortLength: 4,
                relinkableFrom: true,
                relinkableTo: true
            },
            $(go.Shape, { stroke: '#9AE6B4', strokeWidth: 2 }),
            $(go.Shape, { toArrow: 'Standard', fill: '#9AE6B4', stroke: null, scale: 1.2 })
            )
        );

        diagram.linkTemplateMap.add('marriage', // Template for marriage relationships (spouse to marriage node)
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

        diagramRef.current = diagram;

        // Selection listener
        diagram.addDiagramListener('ChangedSelection', () => {
            const sel = diagram.selection.first();
            if (sel && sel.data) {
                const data = sel.data as FamilyMember;
                if (data.isMarriageNode) {
                    // Create a special selection object for marriage nodes
                    setSelectedRef.current({
                        key: data.key,
                        name: 'Matrimonio',
                        isMarriageNode: true,
                        spouseKeys: data.spouseKeys
                    } as FamilyMember);
                } else {
                    setSelectedRef.current(data as FamilyMember);
                }
            } else {
                setSelectedRef.current(null);
            }
        });

        // Position marriage nodes between spouses after layout
        const positionMarriageNodes = () => {
            diagram.startTransaction('position marriage nodes');
            
            // First, collect all marriage node data
            const marriageNodeData: Array<{node: go.Node; spouse1: go.Node; spouse2: go.Node}> = [];
            
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
            
            // Position each marriage node and align spouses with proper spacing
            marriageNodeData.forEach(({ node, spouse1, spouse2 }) => {
                const pos1 = spouse1.location;
                const pos2 = spouse2.location;
                
                // Calculate center point between spouses first
                const centerX = (pos1.x + pos2.x) / 2;
                const centerY = (pos1.y + pos2.y) / 2;
                
                // Define the distance from marriage node to each spouse (equidistant)
                const spouseDistance = 100; // Distance from marriage node to each spouse
                
                // Determine which spouse should be on the left based on current positions
                const leftSpouse = pos1.x < pos2.x ? spouse1 : spouse2;
                const rightSpouse = pos1.x < pos2.x ? spouse2 : spouse1;
                
                // Position spouses equidistantly from the marriage node center
                const leftSpouseX = centerX - spouseDistance;
                const rightSpouseX = centerX + spouseDistance;
                
                // Set spouse positions (equidistant from center and aligned horizontally)
                leftSpouse.location = new go.Point(leftSpouseX, centerY);
                rightSpouse.location = new go.Point(rightSpouseX, centerY);
                
                // Position marriage node exactly at the center between spouses
                node.location = new go.Point(centerX, centerY);
            });
            
            diagram.commitTransaction('position marriage nodes');
        };

        // Position marriage nodes only on initial layout, not during manual movement
        let isInitialLayout = true;
        
        diagram.addDiagramListener('InitialLayoutCompleted', () => {
            setTimeout(() => {
                positionMarriageNodes();
                isInitialLayout = false;
            }, 100);
        });
        
        // Only reposition marriage nodes on layout if it's the first time
        diagram.addDiagramListener('LayoutCompleted', () => {
            if (isInitialLayout) {
                setTimeout(positionMarriageNodes, 100);
            }
        });

        // Handle dynamic link creation
        diagram.addDiagramListener('LinkDrawn', (e) => {
            const link = e.subject;
            const fromNode = link.fromNode;
            const toNode = link.toNode;
            
            if (fromNode && toNode && !fromNode.data.isMarriageNode && !toNode.data.isMarriageNode) {
                // Show modal to select relationship type
                handleLinkCreationStartRef.current(fromNode.data.key, toNode.data.key, link);
            } else {
                // Remove invalid link
                diagram.remove(link);
            }
        });

        // Cleanup function
        return () => {
            if (diagram) {
                diagram.div = null;
                diagram.clear();
            }
            diagramRef.current = null;
        };
    }, []); // Solo se ejecuta una vez al montar el componente

    // Update diagram model when members change
    useEffect(() => {
        const $ = go.GraphObject.make;
        if (!diagramRef.current) return;

        const { nodeDataArray, linkDataArray } = buildModel(members);
        const modelData = { nodeDataArray, linkDataArray };
        const model = $(go.GraphLinksModel, modelData);
        diagramRef.current.model = model;

        // Set category for links after model update
        linkDataArray.forEach((linkData, index) => {
            const link = model.linkDataArray[index];
            if (link && linkData.category) {
                model.setDataProperty(link, 'category', linkData.category);
            }
        });
    }, [members, buildModel]);

    // Toolbar functions
    const zoomIn = () => diagramRef.current?.commandHandler.increaseZoom();
    const zoomOut = () => diagramRef.current?.commandHandler.decreaseZoom();
    const fitToView = () => diagramRef.current?.commandHandler.zoomToFit();

    return {
        divRef,
        diagramRef,
        zoomIn,
        zoomOut,
        fitToView
    };
}