import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex flex-col gap-8 text-center items-center justify-center h-[70vh] py-12 px-4 lg:px-8 max-w-3xl mx-auto">
            <Image priority src="/doodles/SwingingDoodle.svg" alt="Loading" width={156} height={156} />
            <h1 className="text-dark font-medium text-2xl lg:text-3xl xl:text-4xl tracking-tighter newsreader">Už to skoro bude...</h1>
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    );
}