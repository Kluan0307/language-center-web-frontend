const SESSION_EVENT = 'language-center:session';
export function getSessionToken(): string | null {
  return sessionStorage.getItem('token') ?? localStorage.getItem('token');
}
export function clearSession() {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem('token');
    storage.removeItem('user');
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function saveSession(token: string, remember: boolean) {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem('token');
    storage.removeItem('user');
  }
  (remember ? localStorage : sessionStorage).setItem('token', token);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function subscribeSession(listener: () => void) {
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(SESSION_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload: unknown = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && typeof payload === 'object' && 'exp' in payload && typeof payload.exp === 'number') {
      return payload.exp * 1000;
    }
  } catch { /* Server authentication handles malformed tokens. */ }
  return null;
}
