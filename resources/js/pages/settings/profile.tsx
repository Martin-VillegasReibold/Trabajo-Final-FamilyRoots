import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
//import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-emerald-100/50 md:p-8 dark:bg-gray-800/95 dark:border-gray-700/50">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Editar Perfil</h1>
                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                                Actualiza tu nombre y correo electrónico
                            </p>
                        </div>
                        <SettingsLayout>
                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-6"
                            >
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nombre</Label>
                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Nombre completo"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.name}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Correo electrónico"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.email}
                                            />
                                        </div>
                                        {mustVerifyEmail &&
                                            auth.user.email_verified_at === null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-blue-700 dark:text-blue-300">
                                                        Tu correo electrónico no está verificado.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="underline underline-offset-4 hover:text-emerald-700 transition-colors"
                                                        >
                                                            Haz clic aquí para reenviar el correo de verificación.
                                                        </Link>
                                                    </p>
                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            Se ha enviado un nuevo enlace de verificación a tu correo electrónico.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                                className="rounded-xl px-6 py-3 font-semibold text-base bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Guardar
                                            </Button>
                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                    Guardado
                                                </p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                            <div className="mt-8">
                                <DeleteUser />
                            </div>
                        </SettingsLayout>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
