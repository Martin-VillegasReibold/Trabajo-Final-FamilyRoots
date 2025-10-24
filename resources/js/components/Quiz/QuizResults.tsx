import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { router } from '@inertiajs/react';
import { QuizResult } from './QuizContainer';

interface Props {
    results: {
        score: number;
        total: number;
        percentage: number;
        results: QuizResult[];
    };
    onResetQuiz: () => void;
}

export default function QuizResults({ results, onResetQuiz }: Props) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Results Summary */}
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="text-center mb-3">
                    <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl dark:text-white">
                        ¡Quiz Completado!
                    </h2>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Has respondido todas las preguntas. Aquí están tus resultados:
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-3">
                    <div className="flex flex-col items-center px-2 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-semibold text-emerald-700 md:text-3xl">
                            {results.score}
                        </div>
                        <div className="text-xs text-gray-600 md:text-sm dark:text-gray-300">Correctas</div>
                    </div>
                    <div className="flex flex-col items-center px-2 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-semibold text-red-600 md:text-3xl">
                            {results.total - results.score}
                        </div>
                        <div className="text-xs text-gray-600 md:text-sm dark:text-gray-300">Incorrectas</div>
                    </div>
                    <div className="flex flex-col items-center px-2 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-semibold text-emerald-700 md:text-3xl">
                            {results.percentage}%
                        </div>
                        <div className="text-xs text-gray-600 md:text-sm dark:text-gray-300">Puntuación</div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                        onClick={onResetQuiz} 
                        variant="outline"
                        className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 md:text-base"
                    >
                        Intentar de Nuevo
                    </Button>
                    <Button 
                        onClick={() => router.visit('/arboles')}
                        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 md:text-base"
                    >
                        Ver Árboles
                    </Button>
                </div>
            </div>

            {/* Detailed Results */}
            <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 dark:text-white">Resultados Detallados</h3>
                <div className="space-y-2">
                    {results.results.map((result, index) => (
                        <div key={index} className="border rounded-lg p-2 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                {result.isCorrect ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">{result.question}</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className={`p-2 rounded ${result.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                            <span className="font-medium">Tu respuesta: </span>
                                            <span className={result.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                                                {result.answers[result.userAnswer] || 'No respondida'}
                                            </span>
                                        </div>
                                        {!result.isCorrect && (
                                            <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                                                <span className="font-medium">Respuesta correcta: </span>
                                                <span className="text-green-700 dark:text-green-300">
                                                    {result.answers[result.correctAnswer]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}