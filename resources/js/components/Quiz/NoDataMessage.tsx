import { Button } from '@/components/ui/button';
import { Brain, Users } from 'lucide-react';
import { router } from '@inertiajs/react';
import { UserTree } from './QuizContainer';

interface Props {
    userTrees: UserTree[];
}

export default function NoDataMessage({ userTrees }: Props) {
    return (
        <div className="mx-auto max-w-7xl">
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
            <div className="rounded-lg bg-white p-6 shadow-sm md:p-8 dark:bg-gray-800">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <Users className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 dark:text-white">
                        No hay suficientes datos para crear un quiz
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                        Necesitas al menos 4 personas en tu árbol genealógico para poder generar preguntas del quiz.
                        <br />
                        Actualmente tienes {userTrees.reduce((total, tree) => total + tree.nodes.length, 0)} personas registradas.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button 
                            onClick={() => router.visit('/arboles')}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            Ir a Árboles Genealógicos
                        </Button>
                        <Button 
                            onClick={() => router.visit('/crear-arbol')}
                            variant="outline"
                            className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                        >
                            Crear Nuevo Árbol
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}