import type {ClassDto,ScheduleDto} from '../types/academic';
import type {RevenueGroup} from '../types/reports';
export const totalCounts=(values:Record<string,number>|undefined)=>values?Object.values(values).reduce((sum,value)=>sum+value,0):undefined;
export function monthStart(today:string){return today.slice(0,7)+'-01';}
export function orderedMonths(rows:RevenueGroup[]){return rows.map(r=>{const [year,month]=r.key.split('-');return {...r,key:year+'-'+month.padStart(2,'0')};}).sort((a,b)=>a.key.localeCompare(b.key));}
export function csvText(rows:(string|number|null|undefined)[][]){
 return '\uFEFF'+rows.map(row=>row.map(value=>{
  let cell=String(value??'');if(/^[=+\-@\t\r]/.test(cell))cell="'"+cell;
  return '"'+cell.replaceAll('"','""')+'"';
 }).join(',')).join('\r\n');
}
export function exportCsv(filename:string,rows:(string|number|null|undefined)[][]){
 const url=URL.createObjectURL(new Blob([csvText(rows)],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function nextSessions(classes:ClassDto[],schedules:ScheduleDto[],today:string,days=7){
 const byClass=new Map(classes.map(c=>[c.id,c]));const rows:{key:string;date:string;schedule:ScheduleDto;schoolClass:ClassDto}[]=[];
 const weekdays=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
 for(let offset=0;offset<days;offset++){
  const date=new Date(today+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+offset);const iso=date.toISOString().slice(0,10);
  for(const slot of schedules){const c=byClass.get(slot.classId);
   if(!c||c.status==='FINISHED'||iso<c.startDate||iso>c.endDate||slot.dayOfWeek!==weekdays[date.getUTCDay()])continue;
   rows.push({key:iso+':'+slot.id,date:iso,schedule:slot,schoolClass:c});
  }
 }
 return rows.sort((a,b)=>(a.date+a.schedule.startTime).localeCompare(b.date+b.schedule.startTime));
}
