import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface BotonAccionProps {
    text: string;
    variant?: "editar" | "eliminar" | "default";
    onClick?: () => void;
    className?: string;
}

export default function BotonAccion({
    text,
    variant = "default",
    onClick,
    className = "",
}: BotonAccionProps) {
    let colorClasses = "";

    switch (variant) {
        case "editar":
            colorClasses = "bg-blue-500 hover:bg-blue-600 text-white";
            break;
        case "eliminar":
            colorClasses = "bg-red-500 hover:bg-red-600 text-white";
            break;
        default:
            colorClasses = "bg-gray-200 hover:bg-gray-300 text-black";
    }

    const Icon =
        variant === "editar" ? Pencil : variant === "eliminar" ? Trash : null;

    return (
        <Button onClick={onClick} className={`${colorClasses} ${className} gap-2`}>
            {Icon && <Icon size={18} />}
            {text}
        </Button>
    );
}
