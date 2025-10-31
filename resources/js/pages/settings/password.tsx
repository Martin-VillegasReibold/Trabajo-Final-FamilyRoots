import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';

//import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-emerald-100/50 md:p-8 dark:bg-gray-800/95 dark:border-gray-700/50">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Actualizar Contraseña</h1>
                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                                Asegúrate de usar una contraseña larga y aleatoria para mantener tu cuenta segura
                            </p>
                        </div>
                        <SettingsLayout>
                            <Form
                                {...PasswordController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                resetOnError={[
                                    'password',
                                    'password_confirmation',
                                    'current_password',
                                ]}
                                resetOnSuccess
                                onError={(errors) => {
                                    if (errors.password) {
                                        passwordInput.current?.focus();
                                    }
                                    if (errors.current_password) {
                                        currentPasswordInput.current?.focus();
                                    }
                                }}
                                className="space-y-6"
                            >
                                {({ errors, processing, recentlySuccessful }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_password">Contraseña actual</Label>
                                            <Input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                type="password"
                                                className="mt-1 block w-full"
                                                autoComplete="current-password"
                                                placeholder="Contraseña actual"
                                            />
                                            <InputError
                                                message={errors.current_password}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Nueva contraseña</Label>
                                            <Input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder="Nueva contraseña"
                                            />
                                            <InputError message={errors.password} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder="Confirmar contraseña"
                                            />
                                            <InputError
                                                message={errors.password_confirmation}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-password-button"
                                                className="rounded-xl px-6 py-3 font-semibold text-base bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Guardar contraseña
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
                        </SettingsLayout>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
