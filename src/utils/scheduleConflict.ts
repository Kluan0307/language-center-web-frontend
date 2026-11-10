import type { SchoolClass } from '../types/schoolClass';
import type { Room } from '../types/room';
import type { Teacher } from '../types/teacher';

export interface ConflictCheckParams {
    currentClassId?: number | null;
    teacherId: number;
    roomId: number;
    scheduleDays: string;
    scheduleTime: string;
    maxSize: number;
    existingClasses: SchoolClass[];
    rooms?: Room[];
    teachers?: Teacher[];
}

export interface ConflictCheckResult {
    hasConflict: boolean;
    teacherConflictClass?: SchoolClass;
    roomConflictClass?: SchoolClass;
    capacityExceeded?: {
        requested: number;
        roomCapacity: number;
        roomName: string;
    };
    warnings: string[];
}

export function checkScheduleConflict({
    currentClassId,
    teacherId,
    roomId,
    scheduleDays,
    scheduleTime,
    maxSize,
    existingClasses,
    rooms = [],
}: ConflictCheckParams): ConflictCheckResult {
    const warnings: string[] = [];
    const activeStatuses: string[] = ['UPCOMING', 'ONGOING', 'FULL'];

    // 1. Check Teacher Conflict
    const teacherConflictClass = existingClasses.find((cls) => {
        if (currentClassId && cls.id === currentClassId) return false;
        if (!activeStatuses.includes(cls.status)) return false;
        return (
            cls.teacher.id === teacherId &&
            cls.scheduleDays === scheduleDays &&
            cls.scheduleTime === scheduleTime
        );
    });

    if (teacherConflictClass) {
        warnings.push(
            `Giáo viên "${teacherConflictClass.teacher.fullName}" đã có lịch dạy lớp [${teacherConflictClass.code} - ${teacherConflictClass.name}] vào khung giờ ${scheduleDays} (${scheduleTime}).`
        );
    }

    // 2. Check Room Conflict
    const roomConflictClass = existingClasses.find((cls) => {
        if (currentClassId && cls.id === currentClassId) return false;
        if (!activeStatuses.includes(cls.status)) return false;
        return (
            cls.room.id === roomId &&
            cls.scheduleDays === scheduleDays &&
            cls.scheduleTime === scheduleTime
        );
    });

    if (roomConflictClass) {
        warnings.push(
            `Phòng "${roomConflictClass.room.name}" đã được xếp cho lớp [${roomConflictClass.code} - ${roomConflictClass.name}] vào khung giờ ${scheduleDays} (${scheduleTime}).`
        );
    }

    // 3. Check Capacity Overflow
    const selectedRoom = rooms.find((r) => r.id === roomId);
    let capacityExceeded: ConflictCheckResult['capacityExceeded'] | undefined;

    if (selectedRoom && maxSize > selectedRoom.capacity) {
        capacityExceeded = {
            requested: maxSize,
            roomCapacity: selectedRoom.capacity,
            roomName: selectedRoom.name,
        };
        warnings.push(
            `Sĩ số lớp (${maxSize} học viên) vượt quá sức chứa tối đa của ${selectedRoom.name} (${selectedRoom.capacity} chỗ).`
        );
    }

    return {
        hasConflict: warnings.length > 0,
        teacherConflictClass,
        roomConflictClass,
        capacityExceeded,
        warnings,
    };
}
