export interface VisitorPass {
  id: number;
  tenantId: number;
  visitorName: string;
  visitorEmail: string; // Added visitor email field
  purpose?: string;
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

// Email notification interfaces
export interface EmailNotificationRequest {
  passId: number;
  visitorEmail: string;
  emailType: 'PASS_CREATED' | 'PASS_APPROVED' | 'PASS_REJECTED';
}

export interface EmailNotificationResponse {
  success: boolean;
  message: string;
  emailId?: number;
}
