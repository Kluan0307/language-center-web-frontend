import type { Attendance } from "../types/attendance";

export const mockAttendances: Attendance[] = [
    {
        id: 1,
        enrollment: { id: 2, student: { id: 2, fullName: "Trần Thị Bình" }, schoolClass: { id: 1, name: "IELTS 6.5 - Sáng thứ 2-4-6" } },
        sessionDate: "2026-05-04",
        status: "PRESENT",
        hasPermission: false,
        recordedBy: { id: 5, username: "teacher1", fullName: "Trần Thị Lan" },
    },
    {
        id: 2,
        enrollment: { id: 3, student: { id: 3, fullName: "Lê Minh Cường" }, schoolClass: { id: 1, name: "IELTS 6.5 - Sáng thứ 2-4-6" } },
        sessionDate: "2026-05-04",
        status: "ABSENT",
        hasPermission: true,
        recordedBy: { id: 5, username: "teacher1", fullName: "Trần Thị Lan" },
    },
    {
        id: 3,
        enrollment: { id: 1, student: { id: 1, fullName: "Nguyễn Văn An" }, schoolClass: { id: 2, name: "A2 cơ bản - Tối thứ 3-5-7" } },
        sessionDate: "2026-05-05",
        status: "LATE",
        hasPermission: false,
        recordedBy: { id: 7, username: "teacher3", fullName: "Phạm Thu Hà" },
    },
    {
        id: 4,
        enrollment: { id: 1, student: { id: 1, fullName: "Nguyễn Văn An" }, schoolClass: { id: 2, name: "A2 cơ bản - Tối thứ 3-5-7" } },
        sessionDate: "2026-05-08",
        status: "ABSENT",
        hasPermission: false,
        recordedBy: { id: 3, username: "staff1", fullName: "Nguyễn Thị Mai" },
    },
];