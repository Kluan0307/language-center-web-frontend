import type { Room } from "../types/room";

export const mockRooms: Room[] = [
    { id: 1, code: "P101", name: "Phòng 101", location: "Tầng 1", capacity: 20, equipment: "Máy chiếu, bảng trắng, loa", status: "AVAILABLE" },
    { id: 2, code: "P102", name: "Phòng 102", location: "Tầng 1", capacity: 15, equipment: "Tivi, loa, bảng trắng", status: "AVAILABLE" },
    { id: 3, code: "P201", name: "Phòng 201", location: "Tầng 2", capacity: 25, equipment: "Máy chiếu, loa, bảng trắng", status: "AVAILABLE" },
    { id: 4, code: "P202", name: "Phòng 202", location: "Tầng 2", capacity: 12, equipment: "Máy chiếu, bảng trắng, loa", status: "MAINTENANCE" },
];