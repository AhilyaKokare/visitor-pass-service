export interface VisitorPass {
  id: number;
  tenantId: number;
  visitorName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPIRED';
  passCode: string;
  visitDateTime: string;
  createdByEmployeeName: string;
  visitorCompany?: string;
}

export interface SecurityPassInfo {
  passId: number;
  visitorName: string;
  passCode: string;
  status: 'APPROVED' | 'CHECKED_IN';
  visitDateTime: string;
  employeeHostName: string;
}
