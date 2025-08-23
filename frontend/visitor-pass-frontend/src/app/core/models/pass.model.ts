export interface VisitorPass {
  id: number;
  tenantId: number;
  visitorName: string;
<<<<<<< HEAD
  visitorEmail: string; // Added visitor email field
  purpose?: string;
=======
  visitorEmail: string; // <-- ADDED THIS LINE
  visitorPhone: string;
  purpose: string;
>>>>>>> 44b2135 (Updated Pagination and notification service)
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPIRED';
  passCode: string;
  visitDateTime: string;
  createdByEmployeeName: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface CreatePassPayload {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  visitDateTime: string;
}

export interface SecurityPassInfo {
  passId: number;
  visitorName:string;
  passCode: string;
  status: 'APPROVED' | 'CHECKED_IN';
  visitDateTime: string;
  employeeHostName: string;
<<<<<<< HEAD
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
=======
}
>>>>>>> 44b2135 (Updated Pagination and notification service)
