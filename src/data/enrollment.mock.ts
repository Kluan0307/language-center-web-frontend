import type { Enrollment } from "../types/enrollment";

export const mockEnrollments: Enrollment[] = [
    {
        id: 1,
        student: { id: 1, fullName: "Nguyễn Văn An", currentLevel: "A2" },
        schoolClass: { id: 2, name: "A2 cơ bản - Tối thứ 3-5-7", code: "A2-01-T357" },
        enrolledAt: "2026-03-10",
        studyStatus: "STUDYING",
    },
    {
        id: 2,
        student: { id: 2, fullName: "Trần Thị Bình", currentLevel: "B1" },
        schoolClass: { id: 1, name: "IELTS 6.5 - Sáng thứ 2-4-6", code: "IELTS01-T246" },
        enrolledAt: "2026-03-28",
        studyStatus: "STUDYING",
    },
    {
        id: 3,
        student: { id: 3, fullName: "Lê Minh Cường", currentLevel: "IELTS 6.0" },
        schoolClass: { id: 1, name: "IELTS 6.5 - Sáng thứ 2-4-6", code: "IELTS01-T246" },
        enrolledAt: "2026-01-05",
        studyStatus: "COMPLETED",
    },
    {
        id: 4,
        student: { id: 4, fullName: "Phạm Thị Dung", currentLevel: "A1" },
        schoolClass: { id: 4, name: "Tiếng Anh thiếu nhi - Sáng thứ 3-5-7", code: "KIDS01-T357" },
        enrolledAt: "2025-12-20",
        studyStatus: "RESERVED",
    },
    {
        id: 5,
        student: { id: 1, fullName: "Nguyễn Văn An", currentLevel: "A2" },
        schoolClass: { id: 3, name: "TOEIC 650+ - Tối thứ 2-4-6", code: "TOEIC01-T246" },
        enrolledAt: "2026-04-15",
        studyStatus: "STUDYING",
    },
];