import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import AppearanceToggleTab from '@/components/appearance-tabs';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <AppearanceToggleTab className="absolute top-3 right-3 md:top-1 md:right-1" /> {/* Para pruebas de modo oscuro/claro */}
        {children}
    </AppLayoutTemplate>
);
