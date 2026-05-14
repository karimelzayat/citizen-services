export type UserRole = "Admin" | "Supervisor" | "Employee" | "Guest" | "FollowUpSpecialist" | "AdminOnly" | "HotlineAndLimitedAdmin";

export interface UserCapabilities {
  // Main Section Visibility
  canViewHotlineSection: boolean;
  canViewAdminSection: boolean;
  canViewHelpCenterSection: boolean;

  // Hotline Tabs
  canViewDashboard: boolean;
  canRegisterHotline: boolean;
  canSearchHotline: boolean;
  canFollowUpHotline: boolean;
  
  // Admin Tabs
  canRegisterAdminWork: boolean;
  canViewDirectorAssignments: boolean;
  canViewSchedules: boolean;
  canViewReports: boolean;
  canViewSettings: boolean;

  // Help Center Tabs
  canViewInquiry: boolean;
  canViewPhonebook: boolean;
  canViewFAQ: boolean;

  // Global Actions
  canEditAny: boolean;
  showMonthlyCount: boolean;
  canApproveSwaps?: boolean;
}

export interface UserPermissions extends UserCapabilities {
  role: UserRole;
}

export interface Complaint {
  id?: string;
  timestamp: Date;
  callerName: string;
  phoneNumber: string;
  governorate: string;
  isEmergency: boolean;
  hospitalType?: string;
  responsibleEntity?: string;
  hospitalName?: string;
  emergencyGovernorate?: string;
  hospitalAddress?: string;
  diagnosis?: string;
  otherDiagnosis?: string;
  complaintEntity?: string;
  complaintSubject: string;
  complaintStatus: string;
  callDetails: string;
  status: string;
  followUpStatus?: string;
  followUpNotes?: string;
  employeeName: string;
  employeeEmail: string;
  attachmentUrl?: string;
  isCabinetComplaint?: boolean;
  cabinetNationalId?: string;
  cabinetCity?: string;
  cabinetAddress?: string;
  cabinetSubject?: string;
}

export interface AdminComplaint {
  id?: string;
  timestamp: Date;
  workType: "الجاري" | "شكاوي غير مسجلة" | "توجية خطأ";
  complaintNo: string;
  governorate?: string;
  status?: string;
  notes?: string;
  registrant?: string;
  employeeName: string;
  employeeEmail: string;
}

export interface DirectorCase {
  id?: string;
  timestamp: Date;
  source: string;
  caseName: string;
  phone: string;
  details: string;
  employee: string;
  action: string;
  status: string;
  updatedAt: Date;
  attachmentUrl?: string;
}

export interface AppNotification {
  id: string;
  userEmail: string;
  message: string;
  status: 'unread' | 'read';
  timestamp: Date;
  actionLink?: string;
  actionData?: any;
}

export interface Schedule {
  id?: string;
  date: string;
  monthYear: string;
  shifts: {
    morning?: string;
    evening?: string;
    night?: string;
    overnight?: string;
  };
}

export interface Inquiry {
  id: string;
  timestamp: Date;
  question: string;
  qUser: string;
  answer?: string;
  aUser?: string;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
}

export interface PhonebookEntry {
  id?: string;
  name: string;
  number: string;
  category?: string;
  governorate?: string;
  entity?: string;
}
