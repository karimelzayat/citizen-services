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
  getDoc,
  writeBatch,
  queryEqual
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Complaint, AdminComplaint, DirectorCase, Inquiry, UserPermissions, Employee, FAQ, PhonebookEntry, Schedule, AppNotification } from '../types';
import { ROLE_CAPABILITIES, DEFAULT_CAPABILITIES, EMPLOYEE_MAP, INITIAL_EMPLOYEES } from '../constants';

const CHUNK_SIZE = 400;

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
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Permissions & Presence
export async function getUserPermissions(email?: string): Promise<UserPermissions> {
  if (!email) return { ...DEFAULT_CAPABILITIES, role: 'Guest' };
  
  try {
    // Check if employee exists in our system
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const empData = snapshot.docs[0].data() as Employee;
      return {
        ...empData.permissions,
        role: empData.role,
        employeeData: { ...empData, id: snapshot.docs[0].id }
      };
    }

    // Default mapping for predefined employees if not in Firestore yet
    const role: any = email === 'omarkhaledfadel@gmail.com' ? 'Admin' : 'Employee';
    return {
      ...(ROLE_CAPABILITIES[role as keyof typeof ROLE_CAPABILITIES] || DEFAULT_CAPABILITIES),
      role
    };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return { ...DEFAULT_CAPABILITIES, role: 'Guest' };
  }
}

// Subscriptions
export function subscribeToComplaints(callback: (data: Complaint[]) => void) {
  const q = query(collection(db, 'complaints'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Complaint[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'complaints'));
}

export function subscribeToAdminComplaints(callback: (data: AdminComplaint[]) => void) {
  const q = query(collection(db, 'adminComplaints'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as AdminComplaint[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'adminComplaints'));
}

export function subscribeToInquiries(callback: (data: Inquiry[]) => void) {
  const q = query(collection(db, 'inquiries'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Inquiry[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'inquiries'));
}

export function subscribeToFAQs(callback: (data: FAQ[]) => void) {
  return onSnapshot(collection(db, 'faqs'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as FAQ[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'faqs'));
}

export function subscribeToEmployees(callback: (data: Employee[]) => void) {
  return onSnapshot(collection(db, 'employees'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Employee[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));
}

export function subscribeToDirectorCases(callback: (data: DirectorCase[]) => void) {
  const q = query(collection(db, 'directorCases'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as DirectorCase[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'directorCases'));
}

// CRUD Operations
export async function addComplaint(data: Omit<Complaint, 'id'>) {
  try {
    return await addDoc(collection(db, 'complaints'), {
      ...data,
      timestamp: serverTimestamp(),
      employeeEmail: auth.currentUser?.email || ''
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'complaints');
  }
}

export async function updateComplaint(id: string, data: Partial<Complaint>) {
  try {
    await updateDoc(doc(db, 'complaints', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `complaints/${id}`);
  }
}

export async function deleteComplaint(id: string) {
  try {
    await deleteDoc(doc(db, 'complaints', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `complaints/${id}`);
  }
}

export async function addAdminComplaint(data: Omit<AdminComplaint, 'id' | 'timestamp' | 'employeeEmail'>) {
  try {
    return await addDoc(collection(db, 'adminComplaints'), {
      ...data,
      timestamp: serverTimestamp(),
      employeeEmail: auth.currentUser?.email || ''
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'adminComplaints');
  }
}

export async function addInquiry(data: { question: string, qUser: string }) {
  try {
    return await addDoc(collection(db, 'inquiries'), {
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'inquiries');
  }
}

export async function updateInquiry(id: string, data: Partial<Inquiry>) {
  try {
    await updateDoc(doc(db, 'inquiries', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
  }
}

export async function deleteInquiry(id: string) {
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
  }
}

export async function addFAQ(data: Omit<FAQ, 'id'>) {
  try {
    return await addDoc(collection(db, 'faqs'), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'faqs');
  }
}

export async function updateFAQ(id: string, data: Partial<FAQ>) {
  try {
    await updateDoc(doc(db, 'faqs', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `faqs/${id}`);
  }
}

export async function deleteFAQ(id: string) {
  try {
    await deleteDoc(doc(db, 'faqs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `faqs/${id}`);
  }
}

export async function addDirectorCase(data: Omit<DirectorCase, 'id'>) {
  try {
    return await addDoc(collection(db, 'directorCases'), {
      ...data,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'directorCases');
  }
}

export async function updateDirectorCase(id: string, data: Partial<DirectorCase>) {
  try {
    await updateDoc(doc(db, 'directorCases', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `directorCases/${id}`);
  }
}

export async function deleteDirectorCase(id: string) {
  try {
    await deleteDoc(doc(db, 'directorCases', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `directorCases/${id}`);
  }
}

export async function addEmployee(data: Omit<Employee, 'id'>) {
  try {
    return await addDoc(collection(db, 'employees'), {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'employees');
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  try {
    await updateDoc(doc(db, 'employees', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `employees/${id}`);
  }
}

export async function deleteEmployee(id: string) {
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `employees/${id}`);
  }
}

// Bulk Uploads with Chunking
async function runInChunks(data: any[], collectionName: string, transform?: (item: any) => any, idGenerator?: (item: any) => string) {
  const chunks = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(item => {
      const finalData = transform ? transform(item) : item;
      const docRef = idGenerator 
        ? doc(db, collectionName, idGenerator(item))
        : doc(collection(db, collectionName));
      batch.set(docRef, finalData);
    });
    await batch.commit();
  }
}

export async function bulkUploadFAQs(data: Omit<FAQ, 'id'>[]) {
  return runInChunks(data, 'faqs');
}

export async function bulkUploadInquiries(data: Omit<Inquiry, 'id' | 'timestamp'>[]) {
  return runInChunks(data, 'inquiries', (item) => ({
    ...item,
    timestamp: serverTimestamp()
  }));
}

export async function bulkUploadPhonebook(data: Omit<PhonebookEntry, 'id'>[]) {
  return runInChunks(data, 'phonebook');
}

export async function bulkUploadAdminWork(data: any[]) {
  const userEmail = auth.currentUser?.email || '';
  return runInChunks(data, 'adminComplaints', (item) => ({
    ...item,
    employeeEmail: userEmail,
    isBulkUploaded: true,
    timestamp: item.timestamp || serverTimestamp()
  }));
}

export async function bulkUploadSchedules(data: Omit<Schedule, 'id'>[]) {
  return runInChunks(data, 'schedules', 
    (item) => ({ ...item, updatedAt: serverTimestamp() }),
    (item) => `${item.date}_${item.monthYear}`.replace(/\//g, '-')
  );
}

export async function deleteBulkAdminWork() {
  try {
    const q = query(collection(db, 'adminComplaints'), where('isBulkUploaded', '==', true));
    const snapshot = await getDocs(q);
    
    const chunks = [];
    for (let i = 0; i < snapshot.docs.length; i += CHUNK_SIZE) {
      chunks.push(snapshot.docs.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    
    return snapshot.size;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'adminComplaints (bulk)');
  }
}

export async function deleteSchedulesByMonth(monthYear: string) {
  try {
    const q = query(collection(db, 'schedules'), where('monthYear', '==', monthYear));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `schedules/${monthYear}`);
  }
}

export async function getAvailableScheduleMonths(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, 'schedules'));
    const months = new Set<string>();
    snapshot.docs.forEach(d => {
      const data = d.data();
      if (data.monthYear) months.add(data.monthYear);
    });
    return Array.from(months);
  } catch (error) {
    return [];
  }
}

export async function updateSchedule(date: string, monthYear: string, data: Partial<Schedule>) {
  try {
    const id = `${date}_${monthYear}`.replace(/\//g, '-');
    await setDoc(doc(db, 'schedules', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `schedules/${date}_${monthYear}`);
  }
}

export function listenToSchedules(monthYear: string, callback: (data: Schedule[]) => void) {
  const q = query(collection(db, 'schedules'), where('monthYear', '==', monthYear));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Schedule[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'schedules'));
}

export function subscribeToPhonebook(callback: (data: PhonebookEntry[]) => void) {
  return onSnapshot(collection(db, 'phonebook'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PhonebookEntry[];
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'phonebook'));
}

export async function searchPhonebook(entity: string, governorate: string): Promise<PhonebookEntry[]> {
  try {
    const q = query(
      collection(db, 'phonebook'), 
      where('entity', '==', entity),
      where('governorate', '==', governorate)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as PhonebookEntry[];
  } catch (error) {
    return [];
  }
}

export async function searchComplaints(filters: { date?: string, phoneNumber?: string, callerName?: string }): Promise<Complaint[]> {
  try {
    let q = query(collection(db, 'complaints'), orderBy('timestamp', 'desc'));
    
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(start)), where('timestamp', '<=', Timestamp.fromDate(end)));
    }
    
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(d => ({ 
      ...d.data(), 
      id: d.id,
      timestamp: d.data().timestamp?.toDate() || new Date()
    })) as Complaint[];

    if (filters.phoneNumber) {
      results = results.filter(r => r.phoneNumber.includes(filters.phoneNumber!));
    }
    if (filters.callerName) {
      results = results.filter(r => r.callerName.includes(filters.callerName!));
    }

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'complaints (search)');
    return [];
  }
}

export async function searchAdminComplaints(filters: { date?: string, complaintNo?: string }): Promise<AdminComplaint[]> {
  try {
    let q = query(collection(db, 'adminComplaints'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(d => ({ 
      ...d.data(), 
      id: d.id,
      timestamp: d.data().timestamp?.toDate() || new Date()
    })) as AdminComplaint[];

    if (filters.date) {
      const searchDate = new Date(filters.date).toLocaleDateString('ar-EG');
      results = results.filter(r => r.timestamp.toLocaleDateString('ar-EG') === searchDate);
    }
    if (filters.complaintNo) {
      results = results.filter(r => r.complaintNo.includes(filters.complaintNo!));
    }
    return results;
  } catch (error) {
    return [];
  }
}

export async function getDashboardStats() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const complaintsRef = collection(db, 'complaints');
    const todayQ = query(complaintsRef, where('timestamp', '>=', Timestamp.fromDate(today)));
    const monthQ = query(complaintsRef, where('timestamp', '>=', Timestamp.fromDate(firstDayOfMonth)));
    
    const [todaySnap, monthSnap, ongoingSnap, directorSnap] = await Promise.all([
      getDocs(todayQ),
      getDocs(monthQ),
      getDocs(query(collection(db, 'adminComplaints'), where('workType', '==', 'الجاري'))),
      getDocs(query(collection(db, 'directorCases'), where('status', '==', 'نشط')))
    ]);

    const topGovs: Record<string, number> = {};
    const topEntities: Record<string, number> = {};
    const topSubjects: Record<string, number> = {};

    todaySnap.docs.forEach(doc => {
      const d = doc.data() as Complaint;
      if (d.governorate) topGovs[d.governorate] = (topGovs[d.governorate] || 0) + 1;
      if (d.responsibleEntity) topEntities[d.responsibleEntity] = (topEntities[d.responsibleEntity] || 0) + 1;
      if (d.complaintSubject) topSubjects[d.complaintSubject] = (topSubjects[d.complaintSubject] || 0) + 1;
    });

    return {
      todayCount: todaySnap.size,
      monthCount: monthSnap.size,
      ongoingCount: ongoingSnap.size,
      directorActive: directorSnap.size,
      topGovs,
      topEntities,
      topSubjects
    };
  } catch (error) {
    return null;
  }
}

export async function getUserMonthlyCallCount(email: string): Promise<number> {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const q = query(
      collection(db, 'complaints'), 
      where('employeeEmail', '==', email),
      where('timestamp', '>=', Timestamp.fromDate(start))
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (error) {
    return 0;
  }
}

export function listenToNotifications(email: string, callback: (data: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), where('userEmail', '==', email), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as AppNotification[];
    callback(data);
  });
}

export async function markNotificationAsRead(id: string) {
  await updateDoc(doc(db, 'notifications', id), { status: 'read' });
}

export function listenToCabinetComplaints(callback: (data: Complaint[]) => void) {
  const q = query(collection(db, 'complaints'), where('isCabinetComplaint', '==', true), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() })) as Complaint[]);
  });
}

export const listenToInquiries = subscribeToInquiries;
export const listenToDirectorCases = subscribeToDirectorCases;

export async function getAllEmployees(): Promise<Employee[]> {
  const snap = await getDocs(collection(db, 'employees'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Employee[];
}

export async function saveEmployee(data: Employee) {
  if (data.id) {
    const { id, ...rest } = data;
    await updateDoc(doc(db, 'employees', id), rest);
  } else {
    await addDoc(collection(db, 'employees'), { ...data, createdAt: serverTimestamp() });
  }
}

export const getFAQs = async (): Promise<FAQ[]> => {
  const snap = await getDocs(collection(db, 'faqs'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id })) as FAQ[];
};

export async function reviewFollowUp(id: string, data: Partial<Complaint>) {
  await updateDoc(doc(db, 'complaints', id), data);
}

export async function deleteBulkFollowUpData(collectionName: string = 'complaints') {
  const q = query(collection(db, collectionName), where('isBulkUploaded', '==', true));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export async function checkAndAddFollowUp(docId: any, complaint: any) {
  if (complaint.needsFollowUp) {
    // Logic could go here to create a notification or special follow-up record
  }
}

export async function getDailyRanking(): Promise<any[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const q = query(collection(db, 'complaints'), where('timestamp', '>=', Timestamp.fromDate(today)));
  const snap = await getDocs(q);
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const name = d.data().employeeName;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export async function getMonthlyRanking(): Promise<any[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(collection(db, 'complaints'), where('timestamp', '>=', Timestamp.fromDate(start)));
  const snap = await getDocs(q);
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const name = d.data().employeeName;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export async function addPhonebookEntry(data: Omit<PhonebookEntry, 'id'>) {
  try {
    return await addDoc(collection(db, 'phonebook'), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'phonebook');
  }
}

export async function updatePhonebookEntry(id: string, data: Partial<PhonebookEntry>) {
  try {
    await updateDoc(doc(db, 'phonebook', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `phonebook/${id}`);
  }
}

export async function deletePhonebookEntry(id: string) {
  try {
    await deleteDoc(doc(db, 'phonebook', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `phonebook/${id}`);
  }
}
