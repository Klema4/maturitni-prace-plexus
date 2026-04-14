'use client';
import Image from "next/image";

/**
 * Komponenta pro hlavičku auth stránek.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.title - Nadpis stránky.
 * @param {string} props.description - Popis stránky.
 * @returns {JSX.Element} AuthHeader komponenta.
 */
export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center space-y-0.5 flex flex-col items-center justify-center">
      <Image src="/doodles/SprintingDoodle.svg" className="mb-4" alt="Auth Header" width={156} height={156} />
      <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark">
        {title}
      </h1>
      <p className="text-base text-zinc-600 tracking-tight font-medium">
        {description}
      </p>
    </div>
  );
}
