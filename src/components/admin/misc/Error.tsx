import { AlertCircle } from "lucide-react";

export default function SkeletonLoader() {
  return (
    <div className="w-full p-4 my-4 bg-red-500/10 rounded-xl flex flex-col items-center justify-center gap-2">
        <AlertCircle className="text-red-400 animate-pulse" size={20} />
        <p className="text-sm tracking-tight font-medium text-red-400">Došlo k chybě při načítání dat. Zkuste to znovu později.</p>
    </div>
  );
}