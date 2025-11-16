import { Button } from '@/components/ui/button';
import { Brain, Users } from 'lucide-react';
import { router } from '@inertiajs/react';
import { UserTree } from './QuizContainer';

interface Props {
    userTrees: UserTree[];
}

export default function NoDataMessage({ userTrees }: Props) {
    return (
        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-3xl">
                <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl border border-emerald-100/50 md:p-12 dark:bg-gray-800/95 dark:border-gray-700/50">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Familiar</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Pon a prueba tu conocimiento sobre tu árbol genealógico</p>
                    </div>
                    {/* Content Container */}
                    <div className="rounded-lg bg-white p-10 shadow-lg dark:bg-gray-800 mx-auto max-w-xl">
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                            <Users className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-3 dark:text-white">
                                No hay suficientes datos para crear un quiz
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                                Necesitas al menos 4 personas en tu árbol genealógico para poder generar preguntas del quiz.<br />
                                Actualmente tienes {userTrees.reduce((total, tree) => total + tree.nodes.length, 0)} personas registradas.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button 
                                    onClick={() => router.visit('/arboles')}
                                    className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer"
                                >
                                    Ir a Árboles Genealógicos
                                </Button>
                                <Button 
                                    onClick={() => router.visit('/crear-arbol')}
                                    variant="outline"
                                    className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                                >
                                    Crear Nuevo Árbol
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}