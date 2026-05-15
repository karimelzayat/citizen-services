import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp, 
  serverTimestamp,
  onSnapshot,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Complaint, AdminComplaint, DirectorCase, Inquiry, UserPermissions, Employee } from '../types';
import { ROLE_CAPABILITIES, DEFAULT_CAPABILITIES, EMPLOYEE_MAP, INITIAL_EMPLOYEES } from '../constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Employee & Permission Management
export async function getUserPermissions(email: string | null | undefined): Promise<UserPermissions> {
  const normalizedEmail = (email || "").trim().toLowerCase();
  
  // 1. High Priority Hardcoded Admins
  const hardcodedAdmins = ['karimelzayat3@gmail.com', 'karimelzayat.1997@gmail.com'];
  let hardcodedPerms: UserPermissions | null = null;
  if (hardcodedAdmins.includes(normalizedEmail)) {
    hardcodedPerms = { role: "Admin", ...ROLE_CAPABILITIES["Admin"] };
  }

  // 2. Try to get permissions from Employees collection
  try {
    const q = query(collection(db, 'employees'), where('email', '==', normalizedEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as Employee;
      const basePermissions = hardcodedPerms || { role: data.role, ...data.permissions };
      return { 
        ...basePermissions,
        employeeData: { id: snapshot.docs[0].id, ...data }
      } as UserPermissions;
    }
  } catch (e) {
    console.error("Firebase error checking employee permissions:", e);
  }
  
  if (hardcodedPerms) return hardcodedPerms;
  return { role: "Guest", ...DEFAULT_CAPABILITIES };
}

export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const snapshot = await getDocs(collection(db, 'employees'));
    if (snapshot.empty && INITIAL_EMPLOYEES.length > 0) {
      console.log("Seeding employees...");
      for (const emp of INITIAL_EMPLOYEES) {
        await saveEmployee({
          ...emp,
          role: 'Employee',
          permissions: { ...ROLE_CAPABILITIES['Employee'] }
        });
      }
      const newSnapshot = await getDocs(collection(db, 'employees'));
      return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'employees');
    return [];
  }
}

export async function saveEmployee(employee: Partial<Employee>) {
  try {
    const docData = sanitize({
      ...employee,
      updatedAt: serverTimestamp(),
      createdAt: employee.id ? undefined : serverTimestamp()
    });

    if (employee.id) {
      await updateDoc(doc(db, 'employees', employee.id), docData);
      return employee.id;
    } else {
      const docRef = await addDoc(collection(db, 'employees'), docData);
      return docRef.id;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'employees');
  }
}

export async function deleteEmployee(id: string) {
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `employees/${id}`);
  }
}

// Helper to recursively remove undefined values before sending to Firestore
function sanitize(data: any): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  
  // Preserve special types that Firestore handles natively
  if (data instanceof Date || data instanceof Timestamp) return data;
  
  // Preserve Firestore sentinels (like FieldValue from serverTimestamp)
  // These are objects but have custom constructors
  if (data.constructor && 
      data.constructor.name !== 'Object' && 
      data.constructor.name !== 'Array') {
    return data;
  }
  
  const cleaned: any = Array.isArray(data) ? [] : {};
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val !== undefined) {
      cleaned[key] = sanitize(val);
    }
  });
  return cleaned;
}

// Complaints
export async function addComplaint(complaint: Partial<Complaint>, file?: File) {
  const user = auth.currentUser;
  
  let attachmentUrl = "";
  if (file) {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `complaints/${fileName}`);
    try {
      await uploadBytes(storageRef, file);
      attachmentUrl = await getDownloadURL(storageRef);
    } catch (err) {
      console.error("Storage upload failed", err);
    }
  }

  const employeeName = user ? (EMPLOYEE_MAP[user.email || ""] || user.email || "Unknown") : "مواطن (ضيف)";

  try {
    const docData = sanitize({
      ...complaint,
      timestamp: serverTimestamp(),
      employeeName,
      employeeEmail: user?.email || "guest@citizen.service",
      attachmentUrl: attachmentUrl || "",
      status: complaint.status || "جديد"
    });
    const docRef = await addDoc(collection(db, 'complaints'), docData);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'complaints');
  }
}

export async function reviewFollowUp(pendingId: string, reviewData: any) {
  try {
    const pendingRef = doc(db, 'followUpPending', pendingId);
    const pendingSnap = await getDoc(pendingRef);
    
    if (!pendingSnap.exists()) throw new Error("Document not found");
    const data = pendingSnap.data();

    await addDoc(collection(db, 'followUpCompleted'), sanitize({
      ...data,
      ...reviewData,
      followUpStatus: 'completed',
      followUpCompletedAt: serverTimestamp(),
    }));

    await deleteDoc(pendingRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `followUpPending/${pendingId}`);
  }
}

export async function checkAndAddFollowUp(complaintId: string, data: any) {
  const isExcluded = data.complaintEntity === 'عدم اختصاص' || data.complaintSubject === 'عدم اختصاص';
  const isSelected = !isExcluded && Math.random() < 0.05;

  if (isSelected) {
    const user = auth.currentUser;
    await addDoc(collection(db, 'followUpPending'), sanitize({
      ...data,
      originalDocId: complaintId,
      followUpStatus: 'pending',
      timestamp: serverTimestamp(),
      employeeName: user?.displayName || 'نظام',
      employeeEmail: user?.email || '',
    }));
  }
}

export async function addFollowUpManual(data: any) {
  try {
    const user = auth.currentUser;
    const docData = sanitize({
      ...data,
      timestamp: serverTimestamp(),
      followUpStatus: 'pending',
      employeeName: user?.displayName || 'نظام',
      employeeEmail: user?.email || '',
      complaintStatus: 'تم الرد'
    });
    await addDoc(collection(db, 'followUpPending'), docData);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'followUpPending');
  }
}

export async function deleteBulkFollowUpData(collectionName: 'followUpPending' | 'followUpCompleted') {
  try {
    const q = query(collection(db, collectionName), where('isBulkUploaded', '==', true));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    
    await batch.commit();
    return snapshot.size;
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, collectionName);
    throw e;
  }
}

export async function searchComplaints(params: { date?: string, phoneNumber?: string, callerName?: string }) {
  try {
    const colRef = collection(db, 'complaints');
    let results: Complaint[] = [];

    // Prioritize search by Phone or Name directly in Firestore
    if (params.phoneNumber) {
      const p = params.phoneNumber.trim();
      console.log(`[Search] Searching by phone: ${p}`);
      const q = query(colRef, where('phoneNumber', '==', p));
      const snapshot = await getDocs(q);
      results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    } 
    else if (params.callerName) {
      const name = params.callerName.trim();
      console.log(`[Search] Searching by name: ${name}`);
      // Try exact match first
      const q = query(colRef, where('callerName', '==', name));
      const snapshot = await getDocs(q);
      results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      
      // If no exact match and name is long enough, try prefix search? 
      // Firestore query(where('name', '>=', name), where('name', '<=', name + '\uf8ff'))
      if (results.length === 0 && name.length >= 3) {
         const qPrefix = query(colRef, 
           where('callerName', '>=', name), 
           where('callerName', '<=', name + '\uf8ff'), 
           limit(100)
         );
         const snapPrefix = await getDocs(qPrefix);
         results = snapPrefix.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      }
    }
    // If only date is provided, use a range query
    else if (params.date) {
      console.log(`[Search] Searching by date range: ${params.date}`);
      const start = new Date(params.date + 'T00:00:00');
      const end = new Date(params.date + 'T23:59:59');
      const q = query(colRef, 
        where('timestamp', '>=', Timestamp.fromDate(start)),
        where('timestamp', '<=', Timestamp.fromDate(end)),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    }
    // Default: Get 100 most recent
    else {
      console.log(`[Search] No params provided, fetching recent complaints`);
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    }

    // In-memory multi-filter for secondary parameters
    if (results.length > 0) {
      results = results.filter(c => {
        // Filter by Date
        if (params.date) {
           if (!c.timestamp) return false;
           try {
             const ts = (c.timestamp as any).toDate ? (c.timestamp as any).toDate() : new Date(c.timestamp as any);
             if (isNaN(ts.getTime())) {
               // Handle corrupted data: if it's a map with _methodName it was corrupted by sanitize
               // We can't know the exact time, but we know it's recent. 
               // For now, if it's corrupted, we can't reliably filter by date, so we return false
               // Unless we want to be generous? Local users might prefer seeing their data.
               return false;
             }
             
             // Compare in local date format (YYYY-MM-DD) to match params.date
             // toISOString() is UTC, which can be off by a day for local users
             const year = ts.getFullYear();
             const month = String(ts.getMonth() + 1).padStart(2, '0');
             const day = String(ts.getDate()).padStart(2, '0');
             const localDate = `${year}-${month}-${day}`;
             
             if (localDate !== params.date) return false;
           } catch (e) { return false; }
        }

        // Filter by Phone
        if (params.phoneNumber) {
          const p = params.phoneNumber.trim();
          if (!c.phoneNumber || !c.phoneNumber.includes(p)) return false;
        }

        // Filter by Name
        if (params.callerName) {
          const n = params.callerName.trim();
          if (!c.callerName || !c.callerName.includes(n)) return false;
        }

        return true;
      });
    }

    // Sort result by timestamp
    results.sort((a, b) => {
      const tsA = (a.timestamp as any)?.toDate?.() || new Date(a.timestamp as any);
      const tsB = (b.timestamp as any)?.toDate?.() || new Date(b.timestamp as any);
      return tsB.getTime() - tsA.getTime();
    });

    console.log(`[Search] Final filtered count: ${results.length}`);
    return results;
  } catch (e) {
    console.error('[Search] Error in searchComplaints', e);
    return [];
  }
}

// Admin Work
export async function addAdminComplaint(data: Partial<AdminComplaint>) {
  const user = auth.currentUser;
  const employeeName = user ? (EMPLOYEE_MAP[user.email || ""] || user.email || "Unknown") : "ضيف";

  try {
    const docData = sanitize({
      ...data,
      timestamp: serverTimestamp(),
      employeeName,
      employeeEmail: user?.email || "guest@admin.service"
    });
    await addDoc(collection(db, 'admin_complaints'), docData);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'admin_complaints');
  }
}

// Director Office
export async function addDirectorCase(data: Partial<DirectorCase>, file?: File) {
  let attachmentUrl = "";
  if (file) {
    const storageRef = ref(storage, `director/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    attachmentUrl = await getDownloadURL(storageRef);
  }

  try {
    const docData = sanitize({
      ...data,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
      attachmentUrl,
      status: "جديد"
    });
    await addDoc(collection(db, 'director_cases'), docData);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'director_cases');
  }
}

export function listenToDirectorCases(callback: (cases: DirectorCase[]) => void) {
  const q = query(collection(db, 'director_cases'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectorCase));
    callback(cases);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'director_cases');
  });
}

// Inquiries
export async function addInquiry(question: string) {
  const user = auth.currentUser;
  const employeeName = user ? (EMPLOYEE_MAP[user.email || ""] || user.email || "Unknown") : "ضيف";

  try {
    await addDoc(collection(db, 'inquiries'), {
      question,
      qUser: employeeName,
      timestamp: serverTimestamp(),
      answer: "",
      aUser: ""
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'inquiries');
  }
}

export function listenToInquiries(callback: (inquiries: Inquiry[]) => void) {
  const q = query(collection(db, 'inquiries'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
    callback(inquiries);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'inquiries');
  });
}

// FAQ
export async function getFAQs() {
  try {
    const q = query(collection(db, 'faq'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as any);
  } catch (e) {
    const err = e as any;
    if (err.code === 'permission-denied') return [];
    handleFirestoreError(e, OperationType.LIST, 'faq');
    return [];
  }
}

// Schedules
export function listenToSchedules(monthYear: string, callback: (schedules: any[]) => void) {
  const q = query(collection(db, 'schedules'), where('monthYear', '==', monthYear), orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (e) => {
    // If no index exists yet, fall back to non-ordered
    const qBasic = query(collection(db, 'schedules'), where('monthYear', '==', monthYear));
    onSnapshot(qBasic, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data.sort((a: any, b: any) => a.date.localeCompare(b.date)));
    });
  });
}

export async function updateSchedule(date: string, monthYear: string, data: any) {
  try {
    const docId = `${monthYear}_${date}`.replace(/[\/\s]/g, '_');
    await setDoc(doc(db, 'schedules', docId), sanitize({
      ...data,
      date,
      monthYear,
      updatedAt: serverTimestamp()
    }));
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'schedules');
  }
}

export async function bulkUploadSchedules(schedules: any[]) {
  try {
    for (const s of schedules) {
      const docId = `${s.monthYear}_${s.date}`.replace(/[\/\s]/g, '_');
      await setDoc(doc(db, 'schedules', docId), sanitize({
        ...s,
        updatedAt: serverTimestamp()
      }));
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'schedules');
  }
}

export async function deleteSchedulesByMonth(monthYear: string) {
  try {
    const q = query(collection(db, 'schedules'), where('monthYear', '==', monthYear));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'schedules', docSnap.id));
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, 'schedules');
  }
}

export async function getAvailableScheduleMonths(): Promise<string[]> {
  try {
    const q = query(collection(db, 'schedules'), limit(5000)); // Sample all since we need unique values
    const snapshot = await getDocs(q);
    const monthsSet = new Set<string>();
    snapshot.docs.forEach(doc => {
      const my = doc.data().monthYear;
      if (my) monthsSet.add(my);
    });
    return Array.from(monthsSet).sort((a, b) => {
      // Basic sorting might be tricky with Arabic names, but usually fine if they follow a pattern
      // Or we can just return what we find
      return b.localeCompare(a); 
    });
  } catch (e) {
    return [];
  }
}

// Hotline Tree
export async function getHotlineTree() {
  try {
    const snapshot = await getDocs(collection(db, 'hotline_tree'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return [];
  }
}

// Phonebook
export async function searchPhonebook(entity: string, governorate: string) {
  try {
    const q = query(
      collection(db, 'phonebook'), 
      where('entity', '==', entity),
      where('governorate', '==', governorate)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (e) {
    return [];
  }
}

// Cabinet Tracking (Special complaints)
export function listenToCabinetComplaints(callback: (complaints: Complaint[]) => void) {
  const q = query(collection(db, 'complaints'), where('isCabinetComplaint', '==', true), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
  }, (e) => handleFirestoreError(e, OperationType.LIST, 'complaints'));
}

// Ranking (Based on active complaints)
export async function getUserRanking() {
  try {
    const q = query(collection(db, 'complaints'), limit(500)); // Sample recent
    const snapshot = await getDocs(q);
    const counts: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const email = doc.data().employeeEmail;
      const name = doc.data().employeeName;
      if (email && email !== 'guest@citizen.service') {
        counts[name || email] = (counts[name || email] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, calls: count }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5)
      .map((user, idx) => ({ ...user, rank: idx + 1 }));
  } catch (e) {
    return [];
  }
}

// Dashboard Stats
// User Management
export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'user_permissions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'user_permissions');
    return [];
  }
}

export async function updateUserPermissions(userId: string, data: any) {
  try {
    await updateDoc(doc(db, 'user_permissions', userId), sanitize(data));
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `user_permissions/${userId}`);
  }
}

export async function addUserPermission(email: string, role: string) {
  const normalizedEmail = email.toLowerCase();
  try {
    await addDoc(collection(db, 'user_permissions'), sanitize({
      email: normalizedEmail,
      role: role,
      addedAt: serverTimestamp()
    }));
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'user_permissions');
  }
}

export async function deleteUserPermission(userId: string) {
  try {
    await deleteDoc(doc(db, 'user_permissions', userId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `user_permissions/${userId}`);
  }
}

export async function getRoleCapabilities() {
  try {
    const snapshot = await getDocs(collection(db, 'role_capabilities'));
    const data: any = {};
    snapshot.docs.forEach(doc => {
      data[doc.id] = doc.data();
    });
    return data;
  } catch (e) {
    return ROLE_CAPABILITIES;
  }
}

export async function updateRoleCapabilities(role: string, capabilities: any) {
  try {
    await setDoc(doc(db, 'role_capabilities', role), sanitize(capabilities));
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `role_capabilities/${role}`);
  }
}

export async function getDashboardStats() {
  try {
    const colRef = collection(db, 'complaints');
    const snapshot = await getDocs(query(colRef, limit(1000)));
    const docs = snapshot.docs.map(d => d.data());
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);

    let todayCount = 0;
    let monthCount = 0;
    const govs: Record<string, number> = {};
    const entities: Record<string, number> = {};
    const subjects: Record<string, number> = {};

    docs.forEach(d => {
      const ts = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
      const dStr = ts.toISOString().split('T')[0];
      
      if (dStr === todayStr) todayCount++;
      if (dStr.startsWith(monthStr)) monthCount++;
      
      if (d.governorate) govs[d.governorate] = (govs[d.governorate] || 0) + 1;
      if (d.complaintEntity) entities[d.complaintEntity] = (entities[d.complaintEntity] || 0) + 1;
      if (d.complaintSubject) subjects[d.complaintSubject] = (subjects[d.complaintSubject] || 0) + 1;
    });

    return {
      todayCount,
      monthCount,
      ongoingCount: docs.filter(d => d.complaintStatus === 'جاري المتابعة').length,
      directorActive: 0, // Placeholder
      topGovs: govs,
      topEntities: entities,
      topSubjects: subjects
    };
  } catch (e) {
    console.error("Dashboard stats error", e);
    return null;
  }
}
