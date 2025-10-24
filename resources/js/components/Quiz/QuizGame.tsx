import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { QuizQuestion } from './QuizContainer';

interface Props {
    quizData: QuizQuestion[];
    currentQuestion: number;
    userAnswers: number[];
    loading: boolean;
    onAnswerSelect: (answerIndex: number) => void;
    onNextQuestion: () => void;
    onPreviousQuestion: () => void;
}

export default function QuizGame({
    quizData,
    currentQuestion,
    userAnswers,
    loading,
    onAnswerSelect,
    onNextQuestion,
    onPreviousQuestion
}: Props) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Progress */}
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Pregunta {currentQuestion + 1} de {quizData.length}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        {Math.round(((currentQuestion + 1) / quizData.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-800">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {quizData[currentQuestion].question}
                    </h2>
                    {quizData[currentQuestion].description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {quizData[currentQuestion].description}
                        </p>
                    )}
                </div>
                
                <div className="space-y-2">
                    {quizData[currentQuestion].answers.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => onAnswerSelect(index)}
                            className={`w-full p-2 text-left rounded-lg border transition-all hover:shadow-lg focus:ring-2 focus:ring-emerald-200 focus:outline-none ${
                                userAnswers[currentQuestion] === index
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">{answer}</span>
                                {userAnswers[currentQuestion] === index && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-3">
                    <Button
                        variant="outline"
                        onClick={onPreviousQuestion}
                        disabled={currentQuestion === 0}
                        className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 md:text-base disabled:opacity-50"
                    >
                        Anterior
                    </Button>
                    <Button
                        onClick={onNextQuestion}
                        disabled={userAnswers[currentQuestion] === undefined || loading}
                        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 md:text-base disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (currentQuestion === quizData.length - 1 ? 'Finalizar' : 'Siguiente')}
                    </Button>
                </div>
            </div>
        </div>
    );
}