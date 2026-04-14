# AI Chat Dialog

AI chat dialog komponent pro komunikaci s OpenAI API, podobný CMDK stylu s moderním UI.

## Funkce

- **Real-time chat** s OpenAI API
- **Kontextová konverzace** - pamatuje si předchozí zprávy
- **Moderní UI** s animacemi podobnými CMDK
- **Klávesové zkratky** - `Ctrl+Shift+A` pro otevření, `Escape` pro zavření
- **Auto-scroll** k nejnovější zprávě
- **Loading states** s animacemi
- **Možnost vymazání** celé historie chatu

## Nastavení

### 1. Environment Variables

Vytvořte `.env.local` soubor s OpenAI API klíčem:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
```

### 2. Systémová zpráva

AI asistent je nakonfigurován se znalostí o:
- Dostupných příkazech v dashboardu
- Klávesových zkratkách
- Navigačních možnostech
- Funkcích aplikace Plexus

## Použití

### Základní použití

```tsx
import { AIChatDialog } from '@/components/ai';

function App() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Otevřít AI Chat
      </button>
      
      <AIChatDialog 
        open={open} 
        setOpen={setOpen} 
      />
    </div>
  );
}
```

### S klávesovými zkratkami

Klávesové zkratky jsou automaticky registrovány při použití v Navbar komponentě:
- `Ctrl+Shift+A` - Otevřít AI chat
- `Escape` - Zavřít dialog

## API Endpoint

### POST `/api/ai-chat`

**Request Body:**
```json
{
  "message": "Jak mohu vytvořit nový článek?",
  "conversation": [
    {
      "role": "user",
      "content": "Předchozí zpráva"
    },
    {
      "role": "assistant", 
      "content": "Odpověď AI"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Můžete vytvořit nový článek pomocí Ctrl+N nebo přechodem na /dashboard/article-editor",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 50,
    "total_tokens": 200
  }
}
```

## Styling

Používá stejný design system jako CMDK:
- **Backdrop**: `bg-black/20` s backdrop blur
- **Panel**: `bg-white/95` s border a shadow
- **Animace**: Fade-in + scale efekt
- **Barvy**: Konzistentní s Tailwind zinc paletou

## Komponenty

### AIChatDialog
Hlavní dialog komponenta s plnou funkcionalitou.

### AIChatDemo  
Demo komponenta pro testování a ukázku funkcí.

## Bezpečnost

- API klíč je chráněn na serveru
- Zprávy se neodesílají pokud není nakonfigurován API klíč
- Error handling pro síťové chyby
- Rate limiting lze přidat na API endpoint úrovni

## Rozšíření

Můžete snadno rozšířit funkcionalitu:
- Přidat vlastní systémové zprávy
- Implementovat ukládání historie do databáze
- Přidat file upload možnosti
- Implementovat streaming responses
