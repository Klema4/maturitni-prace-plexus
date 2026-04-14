'use client'
import * as React from "react";

import { useSidebar } from "./Sidebar";
import Button from "@/components/ui/dashboard/Button";

import { BookText, Command, Menu } from "lucide-react";
import CommandPalette from "./CommandPalette";

/**
 * Navbar pro dashboard (toggle sidebar + command palette).
 * @returns {JSX.Element} Navbar.
 */

export default function Navbar() {
    const { toggle } = useSidebar();
    const [cmdkOpen, setCmdkOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                setCmdkOpen(true);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setCmdkOpen(false);
                return;
            }
        };

        document.addEventListener('keydown', down, {
            capture: true,
            passive: false
        });
        
        return () => {
            document.removeEventListener('keydown', down, {
                capture: true
            } as any);
        };
    }, []);

    return (
        <>
            <CommandPalette open={cmdkOpen} setOpen={setCmdkOpen} />
            <nav className="h-[64px] flex items-center px-4 text-white">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            onClick={toggle}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                    <ul className="flex gap-2">
                        <Button variant="link" UseIcon={Command} onClick={() => setCmdkOpen(true)} href="#">Příkaz</Button>
                        <Button href="/profile" variant="primary" UseIcon={BookText}>Dokumentace</Button>
                    </ul>
                </div>
            </nav>
        </>
    );
}
