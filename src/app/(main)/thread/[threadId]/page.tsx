import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ThreadPage from '@/app/features/threads/ThreadPage';
import { getThreadWithArticle } from '@/app/features/threads/services/threads.service';
import { ThreadIdSchema } from '@/lib/schemas/commentsSchema';

type PageProps = {
    params: Promise<{ threadId: string }>;
};

/**
 * Obalová komponenta pro přístup k params uvnitř Suspense boundary.
 */
async function ThreadPageWrapper({ params }: PageProps) {
    const { threadId } = await params;

    const validatedThreadId = ThreadIdSchema.safeParse(threadId);
    if (!validatedThreadId.success) {
        notFound();
    }

    const initialThread = await getThreadWithArticle(validatedThreadId.data);
    if (!initialThread) {
        notFound();
    }

    return (
        <ThreadPage
            threadId={validatedThreadId.data}
            initialThread={initialThread}
        />
    );
}

/**
 * Server obal komponenta pro thread stránku.
 * Načítá sekce z databáze a informace o threadu s Suspense boundary.
 */
export default function ThreadPageRoute({ params }: PageProps) {
    return (
        <main className="min-h-screen">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <ThreadPageWrapper params={params} />
            </Suspense>
        </main>
    );
}
