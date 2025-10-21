import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import {
  DateSelectArg,
  EventDropArg,
  EventClickArg,
} from "@fullcalendar/core";
import { useState, useEffect } from 'react'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import ConfirmModal from '@/components/FamilyTree/ConfirmModal';

interface Calendar {
    id: number;
    title: string;
    start: Date;
    end: Date;
    color: string;
}

interface Props {
    calendars: Calendar[];
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendario',
        href: '/calendario',
    },
];

export default function Calendar({ calendars, flash }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('#000000');
    const [startdate, setStartdate] = useState('');
    const [enddate, setEnddate] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showToast, setShowToast] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
    const [showMoveConfirmModal, setShowMoveConfirmModal] = useState(false);
    const [eventToMove, setEventToMove] = useState<{ info: EventDropArg; title: string } | null>(null);
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleDateClick = (selected: DateSelectArg) => {
        setStartdate(selected.startStr);
        setEnddate(selected.endStr);
        setIsDialogOpen(true);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/calendario', {
            _method: 'post',
            title,
            startdate,
            enddate,
            color,
        });
        handleCloseDialog();
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTitle('');
        setColor('#000000');
        setStartdate('');
        setEnddate('');
    };

    function formatEvents() {
        return calendars.map((calendar) => ({
            id: calendar.id.toString(),
            title: calendar.title,
            start: new Date(calendar.start),
            end: new Date(calendar.end),
            color: calendar.color,
        }));
    }

    function handleEventDrop(info: EventDropArg) {
        setEventToMove({
            info,
            title: info.event.title || ''
        });
        setShowMoveConfirmModal(true);
    }

    function handleEventClick(data: EventClickArg) {
        setEventToDelete({
            id: data.event.id || '',
            title: data.event.title || ''
        });
        setShowConfirmModal(true);
    }

    function handleConfirmDelete() {
        if (eventToDelete) {
            router.delete(`/calendario/${eventToDelete.id}`, {
                onSuccess: () => {
                    router.reload();
                    setShowConfirmModal(false);
                    setEventToDelete(null);
                },
                onError: () => {
                    alert('Error al eliminar el evento. Por favor, intenta de nuevo.');
                    setShowConfirmModal(false);
                    setEventToDelete(null);
                },
            });
        }
    }

    function handleCancelDelete() {
        setShowConfirmModal(false);
        setEventToDelete(null);
    }

    function handleConfirmMove() {
        if (eventToMove) {
            router.put(`/calendario/${eventToMove.info.event.id}`, {
                _method: 'put',
                start: new Date(eventToMove.info.event.start!).toISOString().slice(0, 10),
                end: new Date(eventToMove.info.event.end!).toISOString().slice(0, 10),
            });
            setShowMoveConfirmModal(false);
            setEventToMove(null);
        }
    }

    function handleCancelMove() {
        if (eventToMove) {
            eventToMove.info.revert();
        }
        setShowMoveConfirmModal(false);
        setEventToMove(null);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendario">
                <style>{`
                    .fc-theme-standard .fc-scrollgrid {
                        border-color: #e5e7eb;
                    }
                    .fc-theme-standard td, .fc-theme-standard th {
                        border-color: #f3f4f6;
                    }
                    .fc-button-primary {
                        background-color: #059669 !important;
                        border-color: #059669 !important;
                    }
                    .fc-button-primary:hover {
                        background-color: #047857 !important;
                        border-color: #047857 !important;
                    }
                    .fc-button-primary:focus {
                        box-shadow: 0 0 0 0.2rem rgba(5, 150, 105, 0.25) !important;
                    }
                    .fc-today-button {
                        background-color: #10b981 !important;
                        border-color: #10b981 !important;
                    }
                    .fc-daygrid-event {
                        border-radius: 4px;
                        font-size: 0.875rem;
                    }
                    .fc-event-title {
                        font-weight: 500;
                    }
                    
                    /* Capitalize first letter of months and days */
                    .fc-toolbar-title,
                    .fc-col-header-cell-cushion {
                        text-transform: capitalize !important;
                    }
                    
                    /* Dark mode styles */
                    .dark .fc-theme-standard .fc-scrollgrid {
                        border-color: #374151;
                    }
                    .dark .fc-theme-standard td, .dark .fc-theme-standard th {
                        border-color: #4b5563;
                        background-color: transparent;
                    }
                    .dark .fc-col-header-cell {
                        background-color: #1f2937;
                    }
                    .dark .fc-col-header-cell-cushion {
                        color: #f9fafb !important;
                    }
                    .dark .fc-daygrid-day {
                        background-color: #111827;
                    }
                    .dark .fc-daygrid-day-number {
                        color: #f9fafb;
                    }
                    .dark .fc-toolbar-title {
                        color: #f9fafb !important;
                    }
                    .dark .fc-today {
                        background-color: rgba(5, 150, 105, 0.1) !important;
                    }
                    .dark .fc-day-other .fc-daygrid-day-number {
                        color: #9ca3af;
                    }
                `}</style>
            </Head>
            <main className="flex-1 bg-slate-50 p-6 dark:bg-gray-900">
                {/* Skip link for keyboard users */}
                <a
                    href="#calendar-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-emerald-800 focus:z-50"
                >
                    Ir al calendario
                </a>
                
                <div className="mx-auto max-w-7xl" id="calendar-content">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendario Familiar</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Organiza eventos importantes y fechas especiales de tu familia</p>
                    </div>
                    
                    {/* Calendar Container */}
                    <div className="rounded-lg bg-white p-6 shadow-sm md:p-8 dark:bg-gray-800">
                        {showToast && (
                            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
                                toastType === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                            } text-white animate-in fade-in slide-in-from-top-5`}>
                                {toastType === 'success' ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <XCircle className="h-5 w-5" />
                                )}
                                <span>{toastMessage}</span>
                            </div>
                        )}
                        
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            locale={esLocale}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            initialView="dayGridMonth"
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            select={handleDateClick}
                            events={formatEvents()}
                            eventDrop={handleEventDrop}
                            eventClick={handleEventClick}
                            height="auto"
                            dayMaxEvents={true}
                            moreLinkClick="popover"
                            eventDisplay="block"
                            dayHeaderFormat={{ weekday: 'short' }}
                        />
                    </div>
                    
                    {/* Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Agregar Evento
                                </DialogTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Crea un nuevo evento en tu calendario familiar
                                </p>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                                        Título del evento
                                    </Label>
                                    <Input 
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Cumpleaños de mamá"
                                        className="w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color" className="text-sm font-medium text-gray-900 dark:text-white">
                                        Color del evento
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            type="color" 
                                            id="color" 
                                            name="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-16 h-10 border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Selecciona un color para identificar el evento
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={handleCloseDialog}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200"
                                    >
                                        Crear Evento
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    {/* Confirm Modal for Event Deletion */}
                    <ConfirmModal
                        open={showConfirmModal}
                        title="Eliminar Evento"
                        description={eventToDelete ? `¿Estás seguro de que quieres eliminar el evento '${eventToDelete.title}'?` : ''}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                    />
                    
                    {/* Confirm Modal for Event Move */}
                    <ConfirmModal
                        open={showMoveConfirmModal}
                        title="Cambiar Fecha del Evento"
                        description={eventToMove ? `¿Estás seguro de que quieres cambiar la fecha del evento '${eventToMove.title}'?` : ''}
                        onConfirm={handleConfirmMove}
                        onCancel={handleCancelMove}
                    />
                </div>
            </main>
        </AppLayout>
    );
}
