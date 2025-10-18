import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:border-gray-700 dark:bg-gray-800" role="banner">
            <div className="flex items-center gap-3">
                <SidebarTrigger 
                    className="-ml-1 hover:bg-emerald-50 hover:text-emerald-800 rounded-md p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 dark:hover:bg-gray-700 dark:focus:ring-emerald-300" 
                    aria-label="Alternar menú lateral"
                />
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                <nav aria-label="Navegación breadcrumb">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </nav>
            </div>
        </header>
    );
}
