'use client'

import { useState } from 'react';
import AIChatDialog from './AIChatDialog';
import { Bot } from 'lucide-react';

export default function AIChatDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">AI Chat Demo</h1>
        
        <div className="space-y-2">
          <p className="text-zinc-600">
            Klikněte na tlačítko níže pro otevření AI chat dialogu.
          </p>
          
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Otevřít AI Chat
          </button>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">Funkce AI chatu:</h2>
          <ul className="text-zinc-600 space-y-1 list-disc list-inside">
            <li>Komunikace s OpenAI API</li>
            <li>Kontextová konverzace</li>
            <li>Nápověda s navigací a příkazy dashboardu</li>
            <li>Automatické scrollování zpráv</li>
            <li>Možnost vymazání historie chatu</li>
            <li>Zavření pomocí Escape</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Nastavení API klíče</h3>
          <p className="text-sm text-amber-700">
            Pro funkčnost AI chatu je potřeba nastavit OpenAI API klíč v souboru <code className="bg-amber-100 px-1 rounded">.env.local</code>:
          </p>
          <pre className="text-xs bg-amber-100 p-2 rounded mt-2 text-amber-800">
            OPENAI_API_KEY=sk-your-api-key-here
          </pre>
        </div>
      </div>

      <AIChatDialog open={open} setOpen={setOpen} />
    </div>
  );
}
