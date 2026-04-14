'use client';

/**
 * CommentTabs komponenta
 * Zobrazuje záložky pro filtrování komentářů (Komentáře / Mé komentáře).
 * @param {Object} props - Vlastnosti komponenty.
 * @param {'comments' | 'myComments'} props.activeTab - Aktivní záložka.
 * @param {(tab: 'comments' | 'myComments') => void} props.onTabChange - Obslužná funkce při změně záložky.
 * @returns {JSX.Element} CommentTabs komponenta.
 */
export function CommentTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: 'comments' | 'myComments';
  onTabChange: (tab: 'comments' | 'myComments') => void;
}) {
  return (
    <div className="flex w-fit items-center justify-center gap-1 bg-white/75 rounded-full p-1.5">
      <button
        type="button"
        onClick={() => onTabChange('comments')}
        className={`px-3 py-2 text-sm font-medium tracking-tight rounded-full cursor-pointer transition-colors ${
          activeTab === 'comments'
            ? 'bg-primary/10 text-primary'
            : 'text-zinc-700 hover:text-dark'
        }`}
      >
        Komentáře
      </button>
      <button
        type="button"
        onClick={() => onTabChange('myComments')}
        className={`px-3 py-2 text-sm font-medium tracking-tight rounded-full cursor-pointer transition-colors ${
          activeTab === 'myComments'
            ? 'bg-primary/10 text-primary'
            : 'text-zinc-700 hover:text-dark'
        }`}
      >
        Mé komentáře
      </button>
    </div>
  );
}
