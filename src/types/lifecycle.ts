export interface LearningEvent {id:number;enrollmentId:number|null;relatedEnrollmentId:number|null;action:string;oldStatus:string|null;newStatus:string;reason:string;effectiveDate:string;expectedReturnDate:string|null;actorName:string;occurredAt:string}
export interface StudyPeriod {id:number;activeFrom:string;activeUntil:string|null}
export interface EnrollmentHistory {periods:StudyPeriod[];events:LearningEvent[]}
export interface ExamRoster {examId:number;examDate:string;frozen:boolean;frozenAt:string|null;frozenByName:string|null;students:{id:number;fullName:string;source:'ENROLLMENT_PERIOD'|'SAVED_GRADE'}[]}
