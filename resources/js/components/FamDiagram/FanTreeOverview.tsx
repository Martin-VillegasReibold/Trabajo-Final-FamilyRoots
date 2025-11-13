import { useRef } from "react";
import * as go from "gojs";
import { useFanTreeDiagram } from "./useFanTreeDiragram";

interface FanTreeOverviewProps {
    arbolId: number;
    height?: string;
    onReady?: (diagram: go.Diagram) => void;
}
export default function FanTreeOverview({ arbolId, height = "300px", onReady }: FanTreeOverviewProps) {
    const diagramRef = useRef<HTMLDivElement | null>(null);

    useFanTreeDiagram(diagramRef, arbolId, onReady);

    return (
        <div
            ref={diagramRef}
            style={{ width: "100%", height, borderRadius: "8px", backgroundColor: "white" }}
            className="w-full h-[150px] rounded-[5px] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
        />
    );
}
