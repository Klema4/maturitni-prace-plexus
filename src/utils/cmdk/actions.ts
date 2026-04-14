type ActionHandler = () => void;

class CommandActionsRegistry {
  private actions = new Map<string, ActionHandler>();

  register(actionId: string, handler: ActionHandler) {
    this.actions.set(actionId, handler);
  }

  unregister(actionId: string) {
    this.actions.delete(actionId);
  }

  execute(actionId: string) {
    const handler = this.actions.get(actionId);
    if (handler) {
      handler();
      return true;
    }
    return false;
  }

  clear() {
    this.actions.clear();
  }
}

export const commandActions = new CommandActionsRegistry();

// Předregistrované globální akce
export function registerDefaultActions() {
  commandActions.register('search', () => {
    // Můžete implementovat vlastní vyhledávací dialog
    const query = prompt('Zadejte vyhledávací dotaz:');
    if (query) {
      alert(`Vyhledávám: ${query}`);
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });

  commandActions.register('refresh', () => {
    alert('Obnovuji stránku...');
    // window.location.reload();
  });

  commandActions.register('help', () => {
    alert('Otevírám nápovědu...');
    // window.open('/help', '_blank');
  });

  commandActions.register('logout', () => {
    if (confirm('Opravdu se chcete odhlásit?')) {
      alert('Odhlašování...');
      // window.location.href = '/logout';
    }
  });
}
