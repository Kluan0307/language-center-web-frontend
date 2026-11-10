import type {Role} from '../types/auth';
import type {AttendanceRow,AttendanceStatus,GradeDto} from '../types/teaching';
import type {ClassStudent} from '../types/academic';
export const ATTENDANCE_LABELS:Record<AttendanceStatus,string>={PRESENT:'Có mặt',ABSENT:'Vắng',LATE:'Đi muộn'};
export const DOCUMENT_LABELS={PENDING:'Chờ duyệt',APPROVED:'Đã duyệt',REJECTED:'Từ chối'};
export const isTeachingManager=(role?:Role)=>role==='SUPER_ADMIN'||role==='ADMIN';
export function attendancePayload(rows:AttendanceRow[]){return rows.map(r=>({enrollmentId:r.enrollmentId,status:r.status,hasPermission:r.status==='ABSENT'&&r.hasPermission}));}
export function gradeRoster(students:Pick<ClassStudent,'id'|'fullName'>[],grades:GradeDto[]){
 const rows=new Map<number,{studentId:number;studentName:string;active:boolean;grade?:GradeDto}>();
 for(const s of students)rows.set(s.id,{studentId:s.id,studentName:s.fullName,active:true});
 for(const g of grades)rows.set(g.studentId,{studentId:g.studentId,studentName:g.studentName,active:rows.has(g.studentId),grade:g});
 return [...rows.values()];
}
export function validateScore(score:unknown,max:number){if(typeof score!=='number'||!Number.isFinite(score)||score<0||score>max||!/^\d+(?:\.\d{1,2})?$/.test(String(score)))throw new Error('Điểm phải từ 0 đến '+max+', tối đa hai chữ số thập phân.');}
export const FILE_EXTENSIONS=['pdf','doc','docx','xls','xlsx','ppt','pptx','png','jpg','jpeg','txt'];
export function validateDocumentFile(file:Pick<File,'name'|'size'>){
 if(file.size<=0||file.size>10*1024*1024)throw new Error('File phải lớn hơn 0 và không quá 10 MB.');
 if(!FILE_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase()??''))throw new Error('Định dạng file không được hỗ trợ.');
 if(file.name.length>200)throw new Error('Tên file không quá 200 ký tự.');
}
export const fileSize=(size:number)=>size<1024?size+' B':size<1024*1024?(size/1024).toFixed(1)+' KB':(size/1024/1024).toFixed(1)+' MB';
