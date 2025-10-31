// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="¿Olvidaste tu contraseña?"
            description="Ingresa tu correo electrónico para recibir un enlace de restablecimiento."
        >
            <Head title="¿Olvidaste tu contraseña?" />

            <Form
                {...PasswordResetLinkController.store.form()}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <Button
                                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Enviar enlace de restablecimiento
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-4">
                <span>O vuelve a </span>
                <TextLink href={login()} className="text-emerald-600 hover:text-emerald-700">iniciar sesión</TextLink>
            </div>
        </AuthLayout>
    );
}
