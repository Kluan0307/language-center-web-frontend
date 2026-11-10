import type { Teacher } from "../types/teacher";

export const mockTeachers: Teacher[] = [
    {
        id: 1,
        account: {
            id: 5,
            username: "teacher1",
            role: "TEACHER",
            status: true
        },
        fullName: "Trần Thị Bình",
        email: "tranthibinh@gmail.com",
        phone: "0911111111",
        specialization: "IELTS",
        qualification: "Thạc sĩ Ngôn ngữ Anh",
        experience: "5 năm",
        certificate: "IELTS 8.0",
        hireDate: "2022-03-01",
        workStatus: "WORKING",
    },
    {
        id: 2,
        account: {
            id: 5,
            username: "teacher2",
            role: "TEACHER",
            status: true
        },
        fullName: "Trần Văn Cường",
        email: "vancuong02@gmail.com",
        phone: "0911111112",
        specialization: "IELTS",
        qualification: "Thạc sĩ Ngôn ngữ Anh",
        experience: "3 năm",
        certificate: "IELTS 8.5",
        hireDate: "2024-03-01",
        workStatus: "WORKING",
    },
    {
        id: 3,
        account: {
            id: 5,
            username: "teacher3",
            role: "TEACHER",
            status: true
        },
        fullName: "Nguyễn Trung Tín",
        email: "nguyentintin33@gmail.com",
        phone: "0911111113",
        specialization: "TOEIC",
        qualification: "Cử nhân Anh Văn",
        experience: "2 năm",
        certificate: "TOEIC 850",
        hireDate: "2023-03-01",
        workStatus: "WORKING",
    },
    {
        id: 4,
        account: {
            id: 5,
            username: "teacher4",
            role: "TEACHER",
            status: true
        },
        fullName: "Lê Minh Anh",
        email: "leminhanh123@gmail.com",
        phone: "0911111114",
        specialization: "TOEIC",
        qualification: "Thạc sĩ Ngôn ngữ Anh",
        experience: "1 năm",
        certificate: "TOEIC 900",
        hireDate: "2025-03-01",
        workStatus: "WORKING",
    },
];