'use client'

import Template from "./template";
import NavbarClient from "@/app/components/blog/NavbarClient";
import FooterClient from "@/app/components/blog/FooterClient";
import { ErrorLatestArticles } from "@/components/screens/error/ErrorLatestArticles";
import Image from "next/image";

export default function GlobalErrorPage() {
  return (
    <Template>
      <NavbarClient />
      <div className="flex flex-col items-center justify-center h-112 w-full gap-4">
        <Image src="/doodles/SittingDoodle.svg" alt="Global Error" width={256} height={256} />
        <h1 className="text-dark font-medium text-4xl xl:text-5xl tracking-tighter newsreader">Došlo k chybě</h1>
        <p className="max-w-sm text-center text-zinc-500 font-medium text-sm lg:text-base tracking-tight">Omlouváme se, ale při načítání stránky došlo k chybě. Zkuste to znovu později.</p>
      </div>
      <ErrorLatestArticles />
      <FooterClient />
    </Template>
  );
}
