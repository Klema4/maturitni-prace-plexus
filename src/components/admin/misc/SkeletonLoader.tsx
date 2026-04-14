import { Loader } from "lucide-react";

export default function SkeletonLoader() {
  return (
    <div className="w-full p-4 my-4 bg-zinc-800/50 rounded-xl flex flex-col items-center justify-center gap-2">
        <Loader className="text-zinc-400 animate-spin" size={20} />
        <p className="text-sm tracking-tight font-medium animate-pulse">Načítám data... prosím o strpení.</p>
    </div>
  );
}