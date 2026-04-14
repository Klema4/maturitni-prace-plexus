'use client';

import { Suspense } from "react";
import Sidebar, { SidebarProvider } from "./Sidebar";
import Navbar from "./Navbar";

/**
 * Layout wrapper pro dashboard.
 * @param {{ children: React.ReactNode }} props - Vlastnosti komponenty.
 * @returns {JSX.Element} PageWrapper.
 */

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex items-center justify-center h-screen w-full lg:p-2 pl-0 pt-0 bg-[#0E0E12]">
                <Suspense fallback={<div className="w-81" />}>
                    <Sidebar />
                </Suspense>
                <div className="w-full h-full">
                    <Navbar />
                    <div className="bg-zinc-900/15 border border-zinc-900/75 rounded-t-xl lg:rounded-xl w-full h-[calc(100%-64px)] overflow-hidden">
                        <div className="max-h-full overflow-y-auto p-4 lg:p-8">{children}</div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
