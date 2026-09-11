import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { UserResponse } from '../types';

export function useAccounts() {
    const [accounts, setAccounts] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await authService.getAccounts();
            setAccounts(data);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Lỗi khi tải danh sách tài khoản!';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    return {
        accounts,
        isLoading,
        error,
        refetch: fetchAccounts,
    };
}
