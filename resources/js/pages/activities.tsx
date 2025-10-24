import AppLayout from '@/layouts/app-layout';
import { activities } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { QuizContainer, UserTree } from '@/components/Quiz';

interface Props {
    userTrees: UserTree[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Actividades',
        href: activities().url,
    },
];

export default function Activities({ userTrees }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quiz Familiar"/>
            <QuizContainer userTrees={userTrees} />
        </AppLayout>
    );
}
