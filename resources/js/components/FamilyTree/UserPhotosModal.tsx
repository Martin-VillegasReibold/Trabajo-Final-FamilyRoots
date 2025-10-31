import React from 'react';

export type UserPhoto = { id: number; url: string; nombre: string };

interface UserPhotosModalProps {
  open: boolean;
  photos: UserPhoto[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function UserPhotosModal({ open, photos, onSelect, onClose }: UserPhotosModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mis Fotos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {photos.length === 0 && (
            <span className="col-span-3 text-gray-400 text-center">No tienes fotos guardadas.</span>
          )}
          {photos.map((foto) => (
            <button
              key={foto.id}
              className="flex flex-col items-center border rounded-lg p-2 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => onSelect(foto.url)}
              title={foto.nombre}
            >
              <img src={foto.url} alt={foto.nombre} className="object-contain h-24 w-32 rounded mb-1 bg-gray-100" />
              <span className="text-xs text-gray-700 dark:text-gray-200 truncate w-full text-center">{foto.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
