import type { Staff } from "../types/staff";

export const mockStaffs: Staff[] = [
    {
        id: 1,
        account: { id: 3, username: "staff1", role: "STAFF", status: true },
        fullName: "Nguyễn Thị Mai",
        email: "mai.nguyen@educenter.com",
        phone: "0955555555",
    },
    {
        id: 2,
        account: { id: 4, username: "staff2", role: "STAFF", status: true },
        fullName: "Vũ Đức Thắng",
        email: "thang.vu@educenter.com",
        phone: "0966666666",
    },
];