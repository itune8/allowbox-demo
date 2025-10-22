// Simple localStorage-backed store with pub/sub to keep Platform and School pages in sync
export type School = { id: string; name: string; students: number; teachers: number; status: 'Active' | 'Past Due' | 'Disabled'; mrr: number; assignedAdmin?: string; updatedAt?: number };
export type Student = { id: string; name: string; className: string; age: number };
export type Staff = { id: string; name: string; role: string };
export type ClassItem = { id: string; name: string; strength: number };
export type TimetableEntry = { id: string; subject: string; day: string; start: string; end: string };
export type Homework = { id: string; title: string; due: string; description?: string; status?: 'Pending' | 'Completed' };
export type Invoice = { id: string; studentId: string; title: string; amount: number; due: string; status: 'Pending' | 'Paid'; paidAt?: string };
export type SupportTicket = {
  id: string;
  title: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Billing' | 'Access' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  submitter: string;
  agentNotes?: string;
  files?: string[];
};

type SchoolEntities = {
  students: Student[];
  staff: Staff[];
  classes: ClassItem[];
  timetable: Record<string, TimetableEntry[]>; // classId -> entries
  attendance: Record<string, Record<string, Record<string, boolean>>>; // date -> classId -> studentId -> present
  homework: Record<string, Homework[]>; // classId -> assignments
  teacherAssignments: Record<string, string[]>; // teacherEmail -> classIds
  parentChildren: Record<string, string[]>; // parentEmail -> studentIds
  invoices: Record<string, Invoice[]>; // studentId -> invoices
};

type StoreShape = {
  currentSchoolId: string;
  schools: School[];
  entities: Record<string, SchoolEntities>;
  tickets: SupportTicket[];
};

const KEY = 'allowbox:store';
const evt = new EventTarget();

const defaultStore: StoreShape = {
  currentSchoolId: 'sch-1',
  schools: [
    { id: 'sch-1', name: 'Xavier School', students: 820, teachers: 45, status: 'Active', mrr: 4100, updatedAt: Date.now() },
    { id: 'sch-2', name: 'Greenwood Academy', students: 560, teachers: 33, status: 'Active', mrr: 2800, updatedAt: Date.now() },
    { id: 'sch-3', name: 'Riverside School', students: 420, teachers: 25, status: 'Past Due', mrr: 2100, updatedAt: Date.now() },
  ],
  entities: {
    'sch-1': { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} },
    'sch-2': { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} },
    'sch-3': { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} },
  },
  tickets: [],
};

function read(): StoreShape {
  if (typeof window === 'undefined') return defaultStore;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(defaultStore));
    return defaultStore;
  }
  try {
    const parsed = JSON.parse(raw) as StoreShape;
    return { ...defaultStore, ...parsed, entities: { ...defaultStore.entities, ...parsed.entities } };
  } catch {
    localStorage.setItem(KEY, JSON.stringify(defaultStore));
    return defaultStore;
  }
}

function write(store: StoreShape) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(store));
  evt.dispatchEvent(new Event('update'));
}

export function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  evt.addEventListener('update', handler);
  return () => evt.removeEventListener('update', handler);
}

export function getStore(): StoreShape { return read(); }
export function setStore(s: StoreShape) { write(s); }

function dedupeSchools(list: School[]): { list: School[]; changed: boolean } {
  // Group by normalized name; keep the entry with the highest updatedAt (recent edit wins)
  const groups = new Map<string, { idx: number; item: School }[]>();
  for (let i = 0; i < list.length; i++) {
    const raw = list[i]!;
    const key = (raw?.name || '').trim().toLowerCase();
    if (!key) continue;
    const arr = groups.get(key) || [];
    arr.push({ idx: i, item: raw });
    groups.set(key, arr);
  }

  const keepIndices = new Set<number>();
  for (const arr of groups.values()) {
    if (arr.length === 1) { keepIndices.add(arr[0]!.idx); continue; }
    // choose by updatedAt desc; tie-breaker by idx desc (latest position)
    arr.sort((a, b) => (b.item.updatedAt ?? 0) - (a.item.updatedAt ?? 0) || b.idx - a.idx);
    keepIndices.add(arr[0]!.idx);
  }

  const seenIds = new Set<string>();
  const out: School[] = [];
  let changed = false;
  for (let i = 0; i < list.length; i++) {
    const raw = list[i]!;
    const name = (raw.name || '').trim();
    if (!name) { changed = true; continue; }
    if (!keepIndices.has(i)) { changed = true; continue; }
    let id = (raw.id || '').trim();
    if (!id) { changed = true; id = `sch-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; }
    if (seenIds.has(id)) { id = `sch-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; changed = true; }
    seenIds.add(id);
    out.push({ ...raw, id, name });
  }
  return { list: out, changed };
}

export function getSchools(): School[] {
  const s = read();
  const before = s.schools;
  const { list: after, changed } = dedupeSchools(before);
  if (changed) {
    s.schools = after;
    // fix currentSchoolId if it no longer exists
    if (!after.some((x) => x.id === s.currentSchoolId)) {
      const oldName = before.find((x) => x.id === s.currentSchoolId)?.name?.trim().toLowerCase();
      const match = oldName ? after.find((x) => x.name.trim().toLowerCase() === oldName) : undefined;
      s.currentSchoolId = match?.id || after[0]?.id || s.currentSchoolId;
    }
    // remove orphaned entities for deleted school ids
    const keepIds = new Set(after.map((x) => x.id));
    for (const id of Object.keys(s.entities)) {
      if (!keepIds.has(id)) delete s.entities[id];
    }
    write(s);
  }
  return s.schools;
}

export function setSchools(next: School[]) {
  const s = read();
  const { list } = dedupeSchools(next);
  s.schools = list;
  // prune entities for removed ids
  const keepIds = new Set(list.map((x) => x.id));
  for (const id of Object.keys(s.entities)) {
    if (!keepIds.has(id)) delete s.entities[id];
  }
  // adjust currentSchoolId if needed
  if (!keepIds.has(s.currentSchoolId)) {
    s.currentSchoolId = list[0]?.id || s.currentSchoolId;
  }
  write(s);
}

export function getCurrentSchoolId(): string { return read().currentSchoolId; }
export function setCurrentSchoolId(id: string) { const s = read(); s.currentSchoolId = id; write(s); }

export function getEntities(id: string): SchoolEntities {
  const s = read();
  const existing = s.entities[id] as Partial<SchoolEntities> | undefined;
  // If none exist, create fresh and write once
  if (!existing) {
    const created: SchoolEntities = {
      students: [],
      staff: [],
      classes: [],
      timetable: {},
      attendance: {},
      homework: {},
      teacherAssignments: {},
      parentChildren: {},
      invoices: {},
    };
    s.entities[id] = created;
    write(s);
    return created;
  }
  // Only write if we actually need to backfill missing keys
  let changed = false;
  const ensured: SchoolEntities = {
    students: existing.students ?? (changed = true, []),
    staff: existing.staff ?? (changed = true, []),
    classes: existing.classes ?? (changed = true, []),
    timetable: existing.timetable ?? (changed = true, {}),
    attendance: existing.attendance ?? (changed = true, {}),
    homework: existing.homework ?? (changed = true, {}),
    teacherAssignments: existing.teacherAssignments ?? (changed = true, {}),
    parentChildren: existing.parentChildren ?? (changed = true, {}),
    invoices: existing.invoices ?? (changed = true, {}),
  } as SchoolEntities;
  if (changed) {
    s.entities[id] = ensured;
    write(s);
  }
  return ensured;
}

export function setStudents(id: string, students: Student[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  // Global dedup: key by name+class+age (case-insensitive), keep-first stable order
  const seen = new Set<string>();
  const deduped: Student[] = [];
  for (const st of students) {
    const key = `${st.name.trim().toLowerCase()}|${st.className.trim().toLowerCase()}|${String(st.age)}`;
    if (!seen.has(key)) { seen.add(key); deduped.push(st); }
  }
  s.entities[id].students = deduped;
  // update school counts
  const idx = s.schools.findIndex((x) => x.id === id);
  if (idx >= 0) s.schools[idx] = { ...s.schools[idx]!, students: deduped.length };
  write(s);
}

export function setStaff(id: string, staff: Staff[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  // Global dedup: key by name+role (case-insensitive), keep-first stable order
  const seen = new Set<string>();
  const deduped: Staff[] = [];
  for (const st of staff) {
    const key = `${st.name.trim().toLowerCase()}|${st.role.trim().toLowerCase()}`;
    if (!seen.has(key)) { seen.add(key); deduped.push(st); }
  }
  s.entities[id].staff = deduped;
  const teacherCount = staff.filter((m) => /teacher/i.test(m.role)).length || staff.length; // heuristic
  const idx = s.schools.findIndex((x) => x.id === id);
  if (idx >= 0) s.schools[idx] = { ...s.schools[idx]!, teachers: teacherCount };
  write(s);
}

export function setClasses(id: string, classes: ClassItem[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  // Dedup classes by name (case-insensitive), keep-first
  const seen = new Set<string>();
  const deduped: ClassItem[] = [];
  for (const c of classes) {
    const key = (c.name || '').trim().toLowerCase();
    if (key && !seen.has(key)) { seen.add(key); deduped.push({ ...c, name: (c.name || '').trim(), strength: Math.max(0, c.strength || 0) }); }
  }
  s.entities[id].classes = deduped;
  write(s);
}

export function setTimetable(id: string, classId: string, entries: TimetableEntry[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  s.entities[id].timetable[classId] = entries;
  write(s);
}

export function setAttendance(id: string, date: string, classId: string, records: Record<string, boolean>) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  if (!s.entities[id].attendance[date]) s.entities[id].attendance[date] = {};
  s.entities[id].attendance[date][classId] = records;
  write(s);
}

export function setHomework(id: string, classId: string, items: Homework[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  s.entities[id].homework[classId] = items;
  write(s);
}

export function setTeacherAssignments(id: string, teacherEmail: string, classIds: string[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  s.entities[id].teacherAssignments[teacherEmail] = classIds;
  write(s);
}

// Parent-Children mapping
export function setParentChildren(id: string, parentEmail: string, studentIds: string[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  s.entities[id].parentChildren[parentEmail] = Array.from(new Set(studentIds));
  write(s);
}

// Invoices and Payments
export function setInvoices(id: string, studentId: string, items: Invoice[]) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  // Dedup invoices by id, keep-first
  const seen = new Set<string>();
  const list: Invoice[] = [];
  for (const inv of items) {
    if (!seen.has(inv.id)) { seen.add(inv.id); list.push(inv); }
  }
  s.entities[id].invoices[studentId] = list;
  write(s);
}

export function addInvoice(id: string, studentId: string, invoice: Invoice) {
  const s = read();
  if (!s.entities[id]) s.entities[id] = { students: [], staff: [], classes: [], timetable: {}, attendance: {}, homework: {}, teacherAssignments: {}, parentChildren: {}, invoices: {} } as SchoolEntities;
  const list = s.entities[id].invoices[studentId] || [];
  if (!list.find((x) => x.id === invoice.id)) list.unshift(invoice);
  s.entities[id].invoices[studentId] = list;
  write(s);
}

export function payInvoice(id: string, studentId: string, invoiceId: string) {
  const s = read();
  if (!s.entities[id]) return;
  const list = s.entities[id].invoices[studentId] || [];
  const idx = list.findIndex((x) => x.id === invoiceId);
  if (idx >= 0) {
    const now = new Date().toISOString();
    list[idx] = { ...list[idx]!, status: 'Paid', paidAt: now };
    s.entities[id].invoices[studentId] = list;
    write(s);
  }
}

// Support Tickets
export function getSupportTickets(): SupportTicket[] {
  return read().tickets || [];
}

export function setSupportTickets(list: SupportTicket[]) {
  const s = read();
  // Dedup by id, keep-first
  const seen = new Set<string>();
  const out: SupportTicket[] = [];
  for (const t of list) {
    if (!seen.has(t.id)) { seen.add(t.id); out.push(t); }
  }
  s.tickets = out;
  write(s);
}

export function upsertSupportTicket(ticket: SupportTicket) {
  const s = read();
  const idx = (s.tickets || []).findIndex((x) => x.id === ticket.id);
  if (idx >= 0) s.tickets[idx] = ticket; else s.tickets.unshift(ticket);
  write(s);
}

export function deleteSupportTicket(id: string) {
  const s = read();
  s.tickets = (s.tickets || []).filter((x) => x.id !== id);
  write(s);
}
