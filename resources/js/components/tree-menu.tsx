import { usePage, Link } from "@inertiajs/react";

export default function TreeMenu() {
    const { arboles } = usePage().props as { arboles: { id: number, name: string }[] };

    return(
        <ul className="ml-4">
            <li>
                <Link href="/crear-arbol" className="block px-4 py-2">
                    ➕ Nuevo Árbol
                </Link>
            </li>
            {arboles && arboles.map((arbol) => (
                <li key={arbol.id}>
                    <Link href={`/espacio-trabajo/${arbol.id}`} className="block px-4 py-2">
                        🌳 {arbol.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
