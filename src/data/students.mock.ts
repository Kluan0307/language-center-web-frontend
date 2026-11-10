// src/mocks/students.mock.ts

import type { Student } from "../types/student";

export const mockStudents: Student[] = [
    {
        id: 1,
        fullName: "Nguyễn Văn An",
        dateOfBirth: "2005-03-12",
        gender: "MALE",
        email: "an.nguyen@gmail.com",
        phone: "0901234567",
        address: "123 Nguyễn Trãi, Q.5, TP.HCM",
        contactPerson: "Nguyễn Văn Bố",
        currentLevel: "A2",
        registeredAt: "2026-01-15",
        status: "STUDYING",
    },
    {
        id: 2,
        fullName: "Trần Thị Bình",
        dateOfBirth: "2008-07-20",
        gender: "FEMALE",
        email: "binh.tran@gmail.com",
        phone: "0912345678",
        address: "45 Lê Lợi, Q.1, TP.HCM",
        contactPerson: "Trần Thị Mẹ",
        currentLevel: "B1",
        registeredAt: "2026-02-01",
        status: "STUDYING",
    },
    {
        id: 3,
        fullName: "Lê Minh Cường",
        dateOfBirth: "2000-11-05",
        gender: "MALE",
        email: "cuong.le@gmail.com",
        phone: "0923456789",
        address: "78 Trần Hưng Đạo, Q.10, TP.HCM",
        contactPerson: "",
        currentLevel: "IELTS 6.0",
        registeredAt: "2025-09-10",
        status: "GRADUATED",
    },
    {
        id: 4,
        fullName: "Phạm Thị Dung",
        dateOfBirth: "2010-01-30",
        gender: "FEMALE",
        email: "dung.pham@gmail.com",
        phone: "0934567890",
        address: "12 Võ Văn Tần, Q.3, TP.HCM",
        contactPerson: "Phạm Văn Cha",
        currentLevel: "A1",
        registeredAt: "2026-03-05",
        status: "PAUSED",
    },

];