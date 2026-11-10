export interface AcademicOverview {
 branchId:number|null;branchName:string|null;studentsByStatus:Record<string,number>;studentsByLevel:Record<string,number>;
 newStudentsThisMonth:number;classesByStatus:Record<string,number>;classOccupancyRate:number;
 leadsByStatus:Record<string,number>;leadConversionRate:number;
}
export interface AcademicReport {overall:AcademicOverview;branches:AcademicOverview[]}
export interface RevenueGroup {key:string;amount:number}
export interface RevenueReport {collected:number;grossCollected:number;voided:number;refunded:number;credit:number;outstanding:number;byMonth:RevenueGroup[];byCourse:RevenueGroup[];byBranch:RevenueGroup[]}
export interface ReportScope {branchId?:number}
export interface RevenueQuery extends ReportScope { allAssigned?:boolean;from?:string;to?:string}
