import { NavFooter } from '@/components/nav-footer';
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
import { dashboard } from '@/routes';
import { home } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar, Users, Home } from 'lucide-react';
import AppLogo from './app-logo';
import { TreePine, Plus  } from 'lucide-react';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Home,
    },
    {
        title: 'Crear Árbol',
        href: '/crear-arbol',
        icon: Plus,
    },
    {
        title: 'Mis Árboles',
        href: '/arboles',
        icon: TreePine,
    },
    {
        title: 'Calendario',
        href: '/calendario',
        icon: Calendar,
    },
    {
        title: 'Actividades',
        href: '/actividades',
        icon: Users,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-slate-50 dark:bg-gray-900">
            <SidebarHeader className="bg-white dark:bg-gray-800 shadow-sm">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild 
                            className="min-h-16 px-4 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-900/20 transition-colors duration-200" 
                        >
                            <Link href={home()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4 bg-white dark:bg-gray-800">
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Navegación
                    </h3>
                    <NavMain items={mainNavItems} />
                </div>
            </SidebarContent>

            <SidebarFooter className="bg-white dark:bg-gray-800 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
