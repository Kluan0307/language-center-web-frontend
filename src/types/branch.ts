export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string | null;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
export interface BranchRequest {
  code: string;
  name: string;
  phone: string;
  address?: string;
}
