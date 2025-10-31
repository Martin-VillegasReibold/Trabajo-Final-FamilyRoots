//import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-emerald-100/50 md:p-8 dark:bg-gray-800/95 dark:border-gray-700/50">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Autenticación en dos pasos</h1>
                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                                Gestiona la autenticación en dos pasos para tu cuenta
                            </p>
                        </div>
                        <SettingsLayout>
                            {twoFactorEnabled ? (
                                <div className="flex flex-col items-start justify-start space-y-4">
                                    <Badge variant="default">Activado</Badge>
                                    <p className="text-muted-foreground">
                                        Con la autenticación en dos pasos activada, se te pedirá un pin seguro durante el inicio de sesión, que puedes obtener desde la app TOTP de tu teléfono.
                                    </p>
                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                    <div className="relative inline">
                                        <Form {...disable.form()}>
                                            {({ processing }) => (
                                                <Button
                                                    variant="destructive"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    <ShieldBan /> Desactivar 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start justify-start space-y-4">
                                    <Badge variant="destructive">Desactivado</Badge>
                                    <p className="text-muted-foreground">
                                        Cuando actives la autenticación en dos pasos, se te pedirá un pin seguro durante el inicio de sesión. Este pin se obtiene desde una app TOTP en tu teléfono.
                                    </p>
                                    <div>
                                        {hasSetupData ? (
                                            <Button
                                                onClick={() => setShowSetupModal(true)}
                                            >
                                                <ShieldCheck />
                                                Continuar configuración
                                            </Button>
                                        ) : (
                                            <Form
                                                {...enable.form()}
                                                onSuccess={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        <ShieldCheck />
                                                        Activar 2FA
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </div>
                            )}
                            <TwoFactorSetupModal
                                isOpen={showSetupModal}
                                onClose={() => setShowSetupModal(false)}
                                requiresConfirmation={requiresConfirmation}
                                twoFactorEnabled={twoFactorEnabled}
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                clearSetupData={clearSetupData}
                                fetchSetupData={fetchSetupData}
                                errors={errors}
                            />
                        </SettingsLayout>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
