import React, { useState, useEffect, useRef } from 'react';

interface FamilyMember {
    key: number | string;
    name: string;
    gender?: 'M' | 'F' | 'Other';
    birthYear?: number;
    deathYear?: number;
    img?: string;
    spouses?: (number | string)[];
    parents?: (number | string)[];
    isMarriageNode?: boolean;
    spouseKeys?: (number | string)[];
}

interface TreeSearchProps {
    members: FamilyMember[];
    onSelectMember: (member: FamilyMember) => void;
    onFocusMember: (memberKey: string | number) => void;
    className?: string;
}

export default function TreeSearch({ 
    members, 
    onSelectMember, 
    onFocusMember, 
    className = '' 
}: TreeSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter members based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMembers([]);
            setIsOpen(false);
            return;
        }

        const filtered = members
            .filter(member => !member.isMarriageNode) // Exclude marriage nodes
            .filter(member => 
                member.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 8); // Limit results to 8

        setFilteredMembers(filtered);
        setIsOpen(filtered.length > 0);
        setHighlightedIndex(-1);
    }, [searchTerm, members]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredMembers.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredMembers[highlightedIndex]) {
                    handleSelectMember(filteredMembers[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle member selection
    const handleSelectMember = (member: FamilyMember) => {
        setSearchTerm(member.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelectMember(member);
        onFocusMember(member.key);
        inputRef.current?.blur();
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setFilteredMembers([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    // Get member display info
    const getMemberDisplayInfo = (member: FamilyMember) => {
        const birthYear = member.birthYear ? `${member.birthYear}` : '?';
        const deathYear = member.deathYear ? `${member.deathYear}` : 'presente';
        const genderIcon = member.gender === 'M' ? '♂' : member.gender === 'F' ? '♀' : '⚪';
        
        return {
            birthYear,
            deathYear,
            genderIcon,
            yearRange: `${birthYear} - ${deathYear}`
        };
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                        className="h-4 w-4 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar miembro del árbol..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && filteredMembers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredMembers.map((member, index) => {
                        const { yearRange, genderIcon } = getMemberDisplayInfo(member);
                        const isHighlighted = index === highlightedIndex;
                        
                        return (
                            <button
                                key={member.key}
                                onClick={() => handleSelectMember(member)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                    isHighlighted ? 'bg-gray-50 dark:bg-gray-700' : ''
                                }`}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={member.img || '/imagenes/logo Arbol.png'} 
                                                alt={`Foto de ${member.name}`}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {member.name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {yearRange}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400 dark:text-gray-500">
                                                {genderIcon}
                                            </span>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* No Results Message */}
            {isOpen && searchTerm && filteredMembers.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            No se encontraron miembros
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Intenta con otro nombre
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}