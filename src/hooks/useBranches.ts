import { useRemoteResource } from './useRemoteResource';
import { branchService } from '../services/branchService';
export function useBranches() { return useRemoteResource(branchService.all, {}); }
