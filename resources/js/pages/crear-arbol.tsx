import AppLayout from '@/layouts/app-layout';
import { crearArbol } from '@/routes';
import { Head, useForm} from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [ { 
    title: 'Crear Árbol', 
    href: crearArbol().url, }, ];


export default function CreateTree() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
    });
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus en el input cuando el componente se monta
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Limpiar errores cuando el usuario empieza a escribir
    useEffect(() => {
        if (data.name && errors.name) {
            clearErrors('name');
        }
    }, [data.name, errors.name, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name.trim()) {
            return;
        }
        post('/crear-arbol');
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Árbol" />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center overflow-hidden dark:from-gray-900 dark:to-gray-800">
                {/* Skip link for keyboard users */}
                <a
                    href="#crear-arbol-form"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800 focus:z-50 focus:shadow-lg"
                >
                    Ir al formulario de creación
                </a>
                
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl border border-emerald-100/50 md:p-8 dark:bg-gray-800/95 dark:border-gray-700/50">
                        {/* Header con icono animado */}
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200" aria-hidden="true">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Crear Árbol Genealógico</h1>
                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                                Comienza a construir la historia de tu familia
                            </p>
                        </div>
                        
                        <form onSubmit={submit} className="space-y-4" id="crear-arbol-form" role="form" aria-label="Formulario para crear árbol genealógico">
                            <div className="space-y-2">
                                <label htmlFor="tree-name" className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white">
                                    Nombre del árbol *
                                </label>
                                <div className="relative">
                                    <input 
                                        ref={inputRef}
                                        id="tree-name"
                                        type="text" 
                                        placeholder="Ej: Familia González, Los Martínez, etc." 
                                        value={data.name} 
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full border-2 px-4 py-3 text-base placeholder-gray-400 shadow-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 ${
                                            errors.name 
                                                ? 'border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                                                : data.name.trim().length > 0
                                                ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20'
                                                : 'border-gray-200 focus:border-emerald-400 bg-white dark:bg-gray-700 dark:border-gray-600'
                                        }`}
                                        aria-describedby={errors.name ? 'name-error' : data.name.trim().length > 0 ? 'name-success' : 'name-help'}
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                        required
                                        maxLength={100}
                                        minLength={3}
                                    />
                                    
                                    {/* Indicador visual de validez */}
                                    {data.name.trim().length >= 3 && !errors.name && (
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Contador de caracteres */}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Mínimo 3 caracteres
                                    </span>
                                    <span className={`${data.name.length > 80 ? 'text-amber-600' : 'text-gray-500'} dark:text-gray-400`}>
                                        {data.name.length}/100
                                    </span>
                                </div>
                                
                                {/* Mensajes de estado */}
                                {errors.name && (
                                    <div id="name-error" className="flex items-center gap-2 mt-2 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:border-red-700 dark:text-red-300" role="alert" aria-live="polite">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>
                                            <span className="sr-only">Error: </span>
                                            {errors.name}
                                        </span>
                                    </div>
                                )}
                                
                                {data.name.trim().length >= 3 && !errors.name && (
                                    <div id="name-success" className="flex items-center gap-2 mt-2 p-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300" aria-live="polite">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>Nombre válido</span>
                                    </div>
                                )}
                                
                                <div id="name-help" className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                                    Elige un nombre descriptivo que identifique tu árbol familiar
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={processing || data.name.trim().length < 3}
                                className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:ring-offset-2 transform hover:scale-[1.02] ${
                                    processing || data.name.trim().length < 3
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl'
                                }`}
                                aria-describedby="button-status"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                                        <span>Creando árbol...</span>
                                        <span className="sr-only">Procesando solicitud, por favor espera</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Crear Árbol Genealógico</span>
                                    </div>
                                )}
                            </button>
                            
                            <div id="button-status" className="sr-only" aria-live="polite">
                                {processing ? 'Creando árbol genealógico, por favor espera' : 
                                 data.name.trim().length < 3 ? 'Ingresa al menos 3 caracteres para continuar' :
                                 'Listo para crear árbol genealógico'}
                            </div>
                        </form>
                        
                        {/* Footer informativo - más compacto */}
                        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium mb-1">Consejo:</p>
                                    <p>Podrás cambiar el nombre o eliminar el árbol en cualquier momento.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
