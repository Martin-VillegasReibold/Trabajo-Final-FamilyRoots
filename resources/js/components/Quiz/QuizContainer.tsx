import { useState } from 'react';
import QuizHeader from './QuizHeader';
import TreeSelector from './TreeSelector';
import QuizGame from './QuizGame';
import QuizResults from './QuizResults';
import NoDataMessage from './NoDataMessage';

export interface QuizQuestion {
    id: string;
    question: string;
    description: string;
    answers: string[];
    correctAnswer: number;
    type: string;
}

export interface QuizResult {
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    answers: string[];
}

export interface UserTree {
    id: number;
    name: string;
    nodes: {
        id: number;
        name: string;
        gender: string;
        birth_year?: number;
        death_year?: number;
    }[];
}

interface Props {
    userTrees: UserTree[];
}

export default function QuizContainer({ userTrees }: Props) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
    const [quizDataForTree, setQuizDataForTree] = useState<QuizQuestion[] | null>(null);
    const [quizResults, setQuizResults] = useState<{
        score: number;
        total: number;
        percentage: number;
        results: QuizResult[];
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleStartQuiz = async () => {
        if (!selectedTreeId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/quiz/generate/${selectedTreeId}`);
            const data = await response.json();
            
            if (response.ok) {
                setQuizDataForTree(data);
                setQuizStarted(true);
                setCurrentQuestion(0);
                setUserAnswers([]);
                setQuizFinished(false);
                setQuizResults(null);
            } else {
                console.error('Error:', data.error);
                alert(data.error || 'Error al generar el quiz');
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
            alert('Error al cargar el quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setUserAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizDataForTree!.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleFinishQuiz();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleFinishQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch('/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    answers: userAnswers,
                    quizData: quizDataForTree
                })
            });

            const results = await response.json();
            setQuizResults(results);
            setQuizFinished(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setQuizFinished(false);
        setCurrentQuestion(0);
        setUserAnswers([]);
        setQuizResults(null);
        setSelectedTreeId(null);
        setQuizDataForTree(null);
    };

    // Verificar si hay al menos un árbol con suficientes nodos
    const hasValidTree = userTrees.some(tree => tree.nodes.length >= 4);
    
    if (!hasValidTree) {
        return <NoDataMessage userTrees={userTrees} />;
    }

    return (
        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-3xl">
                <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl border border-emerald-100/50 md:p-12 dark:bg-gray-800/95 dark:border-gray-700/50">
                    <QuizHeader />
                    <div className="rounded-lg bg-white p-10 shadow-lg dark:bg-gray-800 mx-auto max-w-xl">
                        {!quizStarted && !quizFinished && (
                            <TreeSelector
                                userTrees={userTrees}
                                selectedTreeId={selectedTreeId}
                                onTreeSelect={setSelectedTreeId}
                                onStartQuiz={handleStartQuiz}
                                loading={loading}
                            />
                        )}

                        {quizStarted && !quizFinished && (
                            <QuizGame
                                quizData={quizDataForTree!}
                                currentQuestion={currentQuestion}
                                userAnswers={userAnswers}
                                loading={loading}
                                onAnswerSelect={handleAnswerSelect}
                                onNextQuestion={handleNextQuestion}
                                onPreviousQuestion={handlePreviousQuestion}
                            />
                        )}

                        {quizFinished && quizResults && (
                            <QuizResults
                                results={quizResults}
                                onResetQuiz={resetQuiz}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}