import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const isActive = page.url.startsWith(
                        typeof item.href === 'string' ? item.href : item.href.url,
                    );
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={`
                                    rounded-lg px-3 py-2.5 transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                                    }
                                `}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon className={`h-5 w-5 ${
                                            isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                        }`} />
                                    )}
                                    <span className="font-medium text-sm">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
