import { Brain } from 'lucide-react';

export default function QuizHeader() {
    return (
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Familiar</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
                Pon a prueba tu conocimiento sobre tu árbol genealógico
            </p>
        </div>
    );
}