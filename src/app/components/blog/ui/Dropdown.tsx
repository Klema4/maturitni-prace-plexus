'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/**
 * Typ pro hodnotu řazení komentářů.
 */
export type SortOrder = 'newest' | 'best' | 'oldest';

/**
 * Typ pro jednu možnost v dropdown menu.
 * @property {T} value - Hodnota možnosti.
 * @property {string} label - Zobrazovaný text.
 */
export interface DropdownOption<T = string> {
  value: T;
  label: string;
}

/**
 * Vlastnosti pro SelectDropdown komponentu.
 * @property {T} value - Aktuálně vybraná hodnota.
 * @property {(value: T) => void} onChange - Obslužná funkce volaný při změně hodnoty.
 * @property {DropdownOption<T>[]} options - Pole možností pro dropdown.
 * @property {string} [className] - Další CSS třídy pro wrapper.
 * @property {string} [placeholder] - Zástupný text, pokud není vybrána hodnota.
 * @property {string} [buttonClassName] - Další CSS třídy pro tlačítko.
 */
export interface SelectDropdownProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  className?: string;
  placeholder?: string;
  buttonClassName?: string;
}

/**
 * Modulární dropdown komponenta pro výběr hodnoty.
 * Zobrazuje tlačítko s aktuální hodnotou a rozbalovací menu s možnostmi.
 * Může být použita kdekoliv v aplikaci s libovolnými možnostmi.
 * @param {SelectDropdownProps<T>} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Renderovaná SelectDropdown komponenta.
 */
export function SelectDropdown<T = string>({
  value,
  onChange,
  options,
  className,
  placeholder,
  buttonClassName,
}: SelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentOption = options.find((opt) => opt.value === value);
  const displayLabel = currentOption?.label || placeholder || 'Vyberte možnost';

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center justify-between gap-2 px-3 py-2 border border-zinc-200 rounded-lg bg-white/80 text-sm font-medium tracking-tight text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 cursor-pointer min-w-[140px] ${buttonClassName || ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {displayLabel}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          tabIndex={-1}
          className="absolute right-0 mt-2 w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-1.5 z-20 space-y-0.5"
          role="listbox"
        >
          {options.map((option, index) => (
            <li key={String(option.value)}>
              <button
                type="button"
                className={`w-full rounded-lg text-left px-2 py-1.5 text-sm font-medium tracking-tight hover:bg-primary/10 hover:text-primary cursor-pointer ${
                  value === option.value
                    ? 'bg-primary/10 font-medium text-primary hover:bg-primary/15'
                    : 'text-zinc-700'
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Dropdown komponenta specificky pro řazení komentářů.
 * Používá přednastavené možnosti pro řazení (Nejnovější, Nejlepší, Nejstarší).
 * Pro vlastní možnosti použijte SelectDropdown.
 * @param {Omit<SelectDropdownProps<SortOrder>, 'options'>} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Renderovaná SortDropdown komponenta.
 */
export function SortDropdown({
  value,
  onChange,
  className,
  buttonClassName,
}: Omit<SelectDropdownProps<SortOrder>, 'options'>) {
  const sortOptions: DropdownOption<SortOrder>[] = [
    { value: 'newest', label: 'Nejnovější' },
    { value: 'best', label: 'Nejlepší' },
    { value: 'oldest', label: 'Nejstarší' },
  ];

  return (
    <SelectDropdown
      value={value}
      onChange={onChange}
      options={sortOptions}
      className={className}
      buttonClassName={buttonClassName}
    />
  );
}
