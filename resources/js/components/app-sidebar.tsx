import { usePage, Link } from '@inertiajs/react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Calendar, Users, Home, UploadIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { TreePine, Plus } from 'lucide-react';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: Home },
    { title: 'Crear Árbol', href: '/crear-arbol', icon: Plus },
    { title: 'Mis Árboles', href: '/arboles', icon: TreePine },
    { title: 'Calendario', href: '/calendario', icon: Calendar },
    { title: 'Actividades', href: '/actividades', icon: Users },
    { title: 'Mis Fotos', href: '/mis-fotos', icon: UploadIcon },
];

interface Arbol {
    id: number;
    name: string;
    user_id: number;
}
export function AppSidebar() {
    const { props } = usePage();
    const isCollaborator: boolean = Boolean(props.isCollaborator);
    const arbol = props.arbol as Arbol | undefined;

    // menu reducido para colaboradores (invitados)
    const collaboratorItems: NavItem[] = [
        // enlace directo al workspace (si hay arbol en la pagina)
        ...(arbol ? [{
            title: 'Ir al árbol',
            href: `/espacio-trabajo/${arbol.id}`,
            icon: TreePine,
        }] : []),
    ];

    const itemsToShow = isCollaborator ? collaboratorItems : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-slate-50 dark:bg-gray-900 rounded-xl">
            <SidebarHeader className="bg-white dark:bg-gray-800 shadow-sm rounded-t-xl">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="min-h-16 px-4 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-900/20 transition-colors duration-200 rounded-xl"
                        >
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4 bg-white dark:bg-gray-800 rounded-none">
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Navegación
                    </h3>
                    <NavMain items={itemsToShow} />
                </div>
            </SidebarContent>

            <SidebarFooter className="bg-white dark:bg-gray-800 p-3 rounded-b-xl flex justify-center items-center">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
