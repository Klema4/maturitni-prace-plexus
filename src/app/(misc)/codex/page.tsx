import { Footer, Navbar } from '@/app/components/blog';

/**
 * Stránka Codex
 */
export default function CodexPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto flex flex-col gap-8 my-8 mt-32 px-4">
        <div>
          <h1 className='newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark mb-4'>
            Codex
          </h1>
          <p className="text-zinc-600 text-lg max-w-3xl leading-relaxed tracking-tight">
            Dokumentace a návody.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
