import { Fragment, useState, useEffect, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import { ensureBranch, getActiveBranch, subscribeBranch } from '../utils/branchScope';
import {PASSWORD_REFRESH_EVENT} from '../utils/accountSecurity';
import { authService } from '../services/authService';
import { AuthContext } from './auth-state';
import { isRole } from '../config/navigation';
import { getErrorMessage, isUnauthorized } from '../utils/apiErrors';
import { clearSession, getSessionToken, saveSession, subscribeSession, tokenExpiresAt } from '../utils/authStorage';
import type { UserResponse, LoginPayload, LoginResponse } from '../types';

interface VerifiedSession { token: string; user: UserResponse | null; error: string | null }
export function AuthProvider({ children }: { children: ReactNode }) {
  const activeBranch=useSyncExternalStore(subscribeBranch,getActiveBranch,()=>null);
  const token = useSyncExternalStore(subscribeSession, getSessionToken, () => null);
  const [verified, setVerified] = useState<VerifiedSession | null>(null);
  const logout = useCallback(() => { clearSession(); setVerified(null); }, []);
  const refreshUser = useCallback(async () => {
    const current = getSessionToken();
    if (!current) return;
    try {
      const user = await authService.getMe(undefined, current);
      if (getSessionToken() !== current) return;
      if (!isRole(user.role)) { logout(); return; }
      ensureBranch(user); setVerified({ token: current, user, error: null });
    } catch (error) {
      if (getSessionToken() !== current) return;
      if (isUnauthorized(error)) logout();
      else setVerified({ token: current, user: null, error: getErrorMessage(error) });
    }
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    authService.getMe(controller.signal, token).then((user) => {
      if (controller.signal.aborted || getSessionToken() !== token) return;
      if (!isRole(user.role)) { logout(); return; }
      ensureBranch(user); setVerified({ token, user, error: null });
    }).catch((error: unknown) => {
      if (controller.signal.aborted || getSessionToken() !== token) return;
      if (isUnauthorized(error)) logout();
      else setVerified({ token, user: null, error: getErrorMessage(error) });
    });
    return () => controller.abort();
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;
    const expiry = tokenExpiresAt(token);
    if (expiry === null) return;
    const timer = window.setTimeout(() => {
      if (getSessionToken() === token) logout();
    }, Math.max(0, Math.min(expiry - Date.now(), 2147483647)));
    return () => window.clearTimeout(timer);
  }, [token, logout]);

  useEffect(()=>{
    if(!token)return;
    let pending=false;
    const refresh=()=>{if(pending||document.visibilityState==='hidden')return;pending=true;void refreshUser().finally(()=>{pending=false;});};
    window.addEventListener(PASSWORD_REFRESH_EVENT,refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
    return()=>{window.removeEventListener(PASSWORD_REFRESH_EVENT,refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[token,refreshUser]);

  const login = async (credentials: LoginPayload, remember = false): Promise<LoginResponse> => {
    const data = await authService.login(credentials);
    const user = await authService.getMe(undefined, data.token);
    if (!isRole(user.role)) throw new Error('Vai trò tài khoản không được hỗ trợ.');
    setVerified({ token: data.token, user, error: null });
    saveSession(data.token, remember);
    ensureBranch(user);
    return data;
  };
  const current = token && verified?.token === token ? verified : null;
  const rawUser=current?.user;
  const user=rawUser ? {...rawUser,primaryBranchId:rawUser.branchId,branchId:rawUser.role==='SUPER_ADMIN'?null:
    (rawUser.branchIds??(rawUser.branchId?[rawUser.branchId]:[])).includes(activeBranch??-1)?activeBranch:rawUser.branchId} : null;
  return (
    <AuthContext.Provider value={{ user, token,
      isAuthenticated: !!token && !!current?.user, isLoading: !!token && !current,
      sessionError: current?.error ?? null, login, logout, refreshUser }}>
      <Fragment key={String(user?.accountId)+":"+String(user?.branchId)}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

