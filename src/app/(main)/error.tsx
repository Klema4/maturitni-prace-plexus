'use client'

import NavbarClient from "@/app/components/blog/NavbarClient";
import FooterClient from "@/app/components/blog/FooterClient";
import { ErrorLatestArticles } from "@/components/screens/error/ErrorLatestArticles";
import { MessageSquareWarning } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function ErrorPage(props: ErrorPageProps) {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-112 w-full gap-4">
        <Image src="/doodles/ZombieingDoodle.svg" alt="Error" width={256} height={256} />
        <h1 className="text-dark font-medium text-4xl xl:text-5xl tracking-tighter newsreader">Došlo k chybě</h1>
        <p className="max-w-sm text-center text-zinc-500 font-medium text-sm lg:text-base tracking-tight">Omlouváme se, ale při načítání stránky došlo k chybě. Zkuste to znovu později.</p>
        <p className="text-center text-zinc-500 font-medium text-sm lg:text-base tracking-tight">Nahlaste prosím tento error na <Link href="mailto:vyvojari@plexus.cz" className="text-primary hover:text-primary/80 transition-colors cursor-pointer">vyvojari@plexus.cz</Link>:</p>
        <div className="max-w-xl text-sm text-zinc-600 font-medium tracking-tight bg-rose-500/10 border border-rose-500 rounded-full px-4 py-2.5 flex items-center gap-2">
          <span>
            <MessageSquareWarning className="text-rose-500" size={16} />
          </span>
          <span className="truncate">{props.error.message}</span>
        </div>
      </div>

      <ErrorLatestArticles />
    </div>
  );
}