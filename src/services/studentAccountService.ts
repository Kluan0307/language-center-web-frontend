import { api } from "../api/axiosInstance";
export interface StudentAccount {
  studentId: number;
  studentVersion: number;
  linked: boolean;
  accountId: number | null;
  username: string | null;
  active: boolean | null;
  mustChangePassword: boolean | null;
  version: number | null;
}
export interface ProvisionStudentAccount {
  requestId: string;
  studentId: number;
  expectedStudentVersion: number;
  username: string;
  temporaryPassword: string;
  confirmPassword: string;
}
export const studentAccountService = {
  async get({ studentId }: { studentId: number }, signal?: AbortSignal) {
    return (
      await api.get<StudentAccount>("/auth/student-accounts", {
        params: { studentId },
        signal,
      })
    ).data;
  },
  async create(body: ProvisionStudentAccount) {
    return (await api.post<StudentAccount>("/auth/student-accounts", body))
      .data;
  },
  async recover(requestId: string) {
    return (
      await api.get<StudentAccount>(
        "/auth/student-account-provisionings/" + requestId,
      )
    ).data;
  },
  async status(
    id: number,
    body: { active: boolean; version: number; reason: string },
  ) {
    return (
      await api.patch<StudentAccount>(
        "/auth/student-accounts/" + id + "/status",
        body,
      )
    ).data;
  },
  async reset(
    id: number,
    body: {
      temporaryPassword: string;
      confirmPassword: string;
      version: number;
      reason: string;
    },
  ) {
    return (
      await api.post<StudentAccount>(
        "/auth/student-accounts/" + id + "/reset-password",
        body,
      )
    ).data;
  },
};
