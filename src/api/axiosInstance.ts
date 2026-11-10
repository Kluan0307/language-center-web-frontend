import axios from 'axios';
import {PASSWORD_REFRESH_EVENT} from '../utils/accountSecurity';
import { getActiveBranch } from '../utils/branchScope';
import { clearSession, getSessionToken } from '../utils/authStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  const branch=getActiveBranch();
  if(branch && !config.headers['X-Branch-Id'])config.headers['X-Branch-Id']=String(branch);
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  const token = getSessionToken();
  // An old request must not log out a newer login. Invalid login credentials do not expire a session.
  if (error.response?.status === 401 && error.config?.url !== '/auth/login'
    && token && error.config?.headers?.Authorization === `Bearer ${token}`) clearSession();
  if(error.response?.status===403 && error.response?.data?.code==='PASSWORD_CHANGE_REQUIRED'
    && token && error.config?.headers?.Authorization===('Bearer '+token))window.dispatchEvent(new Event(PASSWORD_REFRESH_EVENT));
  return Promise.reject(error);
});

