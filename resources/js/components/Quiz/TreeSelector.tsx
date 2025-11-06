import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { router } from '@inertiajs/react';
import { UserTree } from './QuizContainer';

interface Props {
    userTrees: UserTree[];
    selectedTreeId: number | null;
    onTreeSelect: (treeId: number | null) => void;
    onStartQuiz: () => void;
    loading: boolean;
}

export default function TreeSelector({ 
    userTrees, 
    selectedTreeId, 
    onTreeSelect, 
    onStartQuiz, 
    loading 
}: Props) {
    return (
        <div>
            {!selectedTreeId ? (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
                        Selecciona el árbol genealógico para el quiz
                    </h2>
                    <div className="space-y-4">
                        {userTrees.filter(tree => tree.nodes.length >= 4).map((tree) => (
                            <button
                                key={tree.id}
                                onClick={() => onTreeSelect(tree.id)}
                                className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-emerald-900/20 cursor-pointer"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{tree.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{tree.nodes.length} personas</p>
                                    </div>
                                    <div className="text-emerald-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Árbol seleccionado: {userTrees.find(t => t.id === selectedTreeId)?.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                        Te haremos preguntas sobre las personas en este árbol genealógico.
                        ¡Veamos qué tan bien conoces a tu familia!
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
                        <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-700">
                                {userTrees.find(t => t.id === selectedTreeId)?.nodes.length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Personas</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-700">10</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Preguntas</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-700">4</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Opciones</div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button 
                            onClick={onStartQuiz}
                            disabled={loading}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md cursor-pointer"
                        >
                            {loading ? 'Generando Quiz...' : 'Comenzar Quiz'}
                        </Button>
                        <Button 
                            onClick={() => onTreeSelect(null)}
                            variant="outline"
                            className="inline-flex items-center rounded-md border bg-white px-6 py-3 text-base font-medium text-emerald-800 hover:bg-emerald-50 shadow-md cursor-pointer"
                        >
                            Cambiar Árbol
                        </Button>
                        <Button 
                            onClick={() => router.visit('/arboles')}
                            variant="outline"
                            className="inline-flex items-center rounded-md border bg-white px-6 py-3 text-base font-medium text-emerald-800 hover:bg-emerald-50 shadow-md cursor-pointer"
                        >
                            Ver mis árboles
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}