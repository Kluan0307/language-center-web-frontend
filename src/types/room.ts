export type RoomStatus = "AVAILABLE" | "MAINTENANCE";

export interface Room {
    id: number;
    code: string;
    name: string;
    location: string;
    capacity: number;
    equipment: string;
    status: RoomStatus;
}