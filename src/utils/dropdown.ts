import { useRef, useState, useEffect, useCallback } from "react";

export function useDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLElement>(null);

    const closeDropdown = useCallback(() => setOpen(false), []);
    const toggleDropdown = useCallback(() => setOpen((o) => !o), []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                toggleRef.current &&
                !toggleRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return { open, dropdownRef, toggleRef, toggleDropdown, closeDropdown };
}
