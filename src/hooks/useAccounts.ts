import { authService, type AccountQuery } from '../services/authService';
import { useRemoteResource } from './useRemoteResource';

export function useAccounts(params: AccountQuery = { page: 0, size: 20 }) {
  const resource = useRemoteResource(authService.getAccounts, params);
  return { ...resource, accounts: resource.data?.content ?? [],
    isLoading: resource.loading, refetch: resource.reload };
}
