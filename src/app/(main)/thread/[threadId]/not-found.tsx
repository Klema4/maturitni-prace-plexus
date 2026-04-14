import FooterClient from "@/app/components/blog/FooterClient";
import NavbarClient from "@/app/components/blog/NavbarClient";
import Image from "next/image";

export default function NotFound() {
  return (
    <>
      <NavbarClient />
      <div className="flex flex-col items-center justify-center h-112 w-full gap-4">
        <Image src="/doodles/SittingDoodle.svg" alt="Not Found" width={256} height={256} />
        <h1 className="text-dark font-medium text-4xl xl:text-5xl tracking-tighter newsreader">Tato stránka neexistuje</h1>
        <p className="max-w-sm text-center text-zinc-500 font-medium text-sm lg:text-base tracking-tight">Omlouváme se, ale stránka, kterou hledáte, nebyla nalezena. Zkuste se vrátit na hlavní stránku.</p>
      </div>
      <FooterClient />
    </>
  );
}