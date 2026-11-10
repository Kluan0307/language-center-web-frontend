import type {LeadState} from './admissions';
export type ContactChannel='CALL'|'EMAIL'|'MESSAGE'|'IN_PERSON'|'NOTE';
export interface LeadInteraction{channel:ContactChannel;note:string;status:Exclude<LeadState,'CONVERTED'>;nextContactAt?:string;version:number}
export interface LeadActivity{id:number;action:string;note:string;channel:ContactChannel|null;oldStatus:LeadState|null;newStatus:LeadState;oldAssigneeName:string|null;assigneeName:string;nextContactAt:string|null;oldNextContactAt:string|null;actorName:string;occurredAt:string}
export interface LeadAssignee{accountId:number;username:string;fullName:string|null;role:'ADMIN'|'STAFF'}
export interface DocumentEvent{id:number;revision:number;action:string;status:string;title:string;description:string|null;filename:string;fileSize:number;reason:string|null;actorName:string|null;occurredAt:string}
