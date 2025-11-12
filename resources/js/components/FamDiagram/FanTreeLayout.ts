import * as go from "gojs";

export const layerThickness = 70;
interface NodeGeometryData {
    angle?: number;
    sweep?: number;
    radius?: number;
}
export function makeAnnularWedge(data:NodeGeometryData): go.Geometry | null {
    const { angle, sweep, radius } = data;
    if (angle === undefined || sweep === undefined || radius === undefined) return null;

    const outer = radius + layerThickness;
    const inner = radius;

    const p = new go.Point(outer, 0).rotate(angle - sweep / 2);
    const q = new go.Point(inner, 0).rotate(angle + sweep / 2);

    const geo = new go.Geometry()
        .add(new go.PathFigure(-outer, -outer))
        .add(new go.PathFigure(outer, outer))
        .add(
            new go.PathFigure(p.x, p.y)
                .add(new go.PathSegment(go.SegmentType.Arc, angle - sweep / 2, sweep, 0, 0, outer, outer))
                .add(new go.PathSegment(go.SegmentType.Line, q.x, q.y))
                .add(new go.PathSegment(go.SegmentType.Arc, angle + sweep / 2, -sweep, 0, 0, inner, inner).close())
        );

    return geo;
}

export function computeTextAlignment(data: NodeGeometryData): go.Spot{
    const { angle, radius } = data;
    if (angle === undefined || radius === undefined) return go.Spot.Center;
    const p = new go.Point(radius + layerThickness / 2, 0).rotate(angle);
    return new go.Spot(0.5, 0.5, p.x, p.y);
}

export function ensureUpright(angle: number) {
    if (angle > 90 && angle < 270) return angle + 180;
    return angle;
}

export class RadialLayoutCustom extends go.Layout {
    layerThickness = 70;

    override doLayout(coll: go.Diagram | go.Group | go.Iterable<go.Part>) {
        const diagram = this.diagram;
        if (!diagram) return;

        diagram.startTransaction("RadialLayoutCustom");

        const root = this.findRoot(diagram);
        if (!root) {
            console.warn("No root found for radial layout.");
            diagram.commitTransaction("RadialLayoutCustom");
            return;
        }

        // --- Construir niveles ---
        const layers: go.Node[][] = [];
        this.buildLayers(root, 0, layers);

        const totalLevels = layers.length;

        for (let level = 0; level < totalLevels; level++) {
            const nodes = layers[level];
            const radius = level * this.layerThickness;

            const angleStep = 360 / nodes.length;

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const angle = i * angleStep;

                let actualSweep = angleStep;
                if (nodes.length === 1 && level > 0) {
                    actualSweep = 40; // MAximo 40° para nodos solitarios
                }

                diagram.model.setDataProperty(node.data, "angle", angle);
                diagram.model.setDataProperty(node.data, "radius", radius);
                diagram.model.setDataProperty(node.data, "sweep", actualSweep);

                node.location = new go.Point(radius, 0).rotate(angle);
            }
        }

        diagram.commitTransaction("RadialLayoutCustom");
    }
    findRoot(diagram: go.Diagram): go.Node | null {
        let root: go.Node | null = null;

        diagram.nodes.each(n => {
            const parentLink = n.findTreeParentLink();

            if (parentLink && parentLink.category === "spouse") return;

            if (!parentLink) {
                root = n;
            }
        });

        return root;
    }

    buildLayers(node: go.Node, level: number, layers: go.Node[][]) {
        if (!layers[level]) layers[level] = [];

        layers[level].push(node);

        node.findTreeChildrenNodes().each(child => {
            this.buildLayers(child, level + 1, layers);
        });
    }
}

