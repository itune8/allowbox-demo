// ============================================================================
// Demo Data for Stakeholder Demos
// Provides realistic mock data for all API endpoints when in demo mode.
// ============================================================================

const TENANT_ID = 'demo-tenant-001';

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------
const classes = [
  {
    _id: 'cls-001',
    id: 'cls-001',
    tenantId: TENANT_ID,
    name: 'Grade 6',
    grade: '6',
    sections: ['A', 'B', 'C'],
    description: 'Middle school - Grade 6',
    capacity: 40,
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'cls-002',
    id: 'cls-002',
    tenantId: TENANT_ID,
    name: 'Grade 7',
    grade: '7',
    sections: ['A', 'B', 'C'],
    description: 'Middle school - Grade 7',
    capacity: 40,
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'cls-003',
    id: 'cls-003',
    tenantId: TENANT_ID,
    name: 'Grade 8',
    grade: '8',
    sections: ['A', 'B', 'C'],
    description: 'Middle school - Grade 8',
    capacity: 40,
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'cls-004',
    id: 'cls-004',
    tenantId: TENANT_ID,
    name: 'Grade 9',
    grade: '9',
    sections: ['A', 'B', 'C'],
    description: 'Secondary school - Grade 9',
    capacity: 40,
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------
const subjects = [
  {
    _id: 'sub-001',
    id: 'sub-001',
    tenantId: TENANT_ID,
    name: 'Mathematics',
    code: 'MATH',
    description: 'Core mathematics curriculum covering algebra, geometry and arithmetic',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'sub-002',
    id: 'sub-002',
    tenantId: TENANT_ID,
    name: 'Science',
    code: 'SCI',
    description: 'General science covering physics, chemistry and biology',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'sub-003',
    id: 'sub-003',
    tenantId: TENANT_ID,
    name: 'English',
    code: 'ENG',
    description: 'English language and literature',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'sub-004',
    id: 'sub-004',
    tenantId: TENANT_ID,
    name: 'Hindi',
    code: 'HIN',
    description: 'Hindi language and literature',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'sub-005',
    id: 'sub-005',
    tenantId: TENANT_ID,
    name: 'Social Studies',
    code: 'SST',
    description: 'History, geography, civics and economics',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'sub-006',
    id: 'sub-006',
    tenantId: TENANT_ID,
    name: 'Computer Science',
    code: 'CS',
    description: 'Computer fundamentals, programming and digital literacy',
    maxMarks: 100,
    passingMarks: 33,
    classes: ['cls-001', 'cls-002', 'cls-003', 'cls-004'],
    isActive: true,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Teachers / Staff
// ---------------------------------------------------------------------------
const teachers = [
  {
    _id: 'tch-001',
    id: 'tch-001',
    email: 'anita.sharma@demoschool.edu',
    firstName: 'Anita',
    lastName: 'Sharma',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43210',
    employeeId: 'EMP001',
    joiningDate: '2020-06-15',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    subjects: [{ _id: 'sub-001', name: 'Mathematics', code: 'MATH' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2020-06-15T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-002',
    id: 'tch-002',
    email: 'rajesh.kumar@demoschool.edu',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43211',
    employeeId: 'EMP002',
    joiningDate: '2019-04-01',
    qualification: 'M.Sc. Physics, B.Ed.',
    subjects: [{ _id: 'sub-002', name: 'Science', code: 'SCI' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2019-04-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-003',
    id: 'tch-003',
    email: 'priya.menon@demoschool.edu',
    firstName: 'Priya',
    lastName: 'Menon',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43212',
    employeeId: 'EMP003',
    joiningDate: '2021-07-01',
    qualification: 'M.A. English Literature, B.Ed.',
    subjects: [{ _id: 'sub-003', name: 'English', code: 'ENG' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2021-07-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-004',
    id: 'tch-004',
    email: 'sunita.verma@demoschool.edu',
    firstName: 'Sunita',
    lastName: 'Verma',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43213',
    employeeId: 'EMP004',
    joiningDate: '2018-01-10',
    qualification: 'M.A. Hindi, B.Ed.',
    subjects: [{ _id: 'sub-004', name: 'Hindi', code: 'HIN' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2018-01-10T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-005',
    id: 'tch-005',
    email: 'amit.patel@demoschool.edu',
    firstName: 'Amit',
    lastName: 'Patel',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43214',
    employeeId: 'EMP005',
    joiningDate: '2022-03-15',
    qualification: 'M.A. History, B.Ed.',
    subjects: [{ _id: 'sub-005', name: 'Social Studies', code: 'SST' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2022-03-15T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-006',
    id: 'tch-006',
    email: 'deepak.nair@demoschool.edu',
    firstName: 'Deepak',
    lastName: 'Nair',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43215',
    employeeId: 'EMP006',
    joiningDate: '2023-06-01',
    qualification: 'M.Tech. Computer Science',
    subjects: [{ _id: 'sub-006', name: 'Computer Science', code: 'CS' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-007',
    id: 'tch-007',
    email: 'kavitha.iyer@demoschool.edu',
    firstName: 'Kavitha',
    lastName: 'Iyer',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43216',
    employeeId: 'EMP007',
    joiningDate: '2021-01-05',
    qualification: 'M.Sc. Chemistry, B.Ed.',
    subjects: [{ _id: 'sub-002', name: 'Science', code: 'SCI' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2021-01-05T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'tch-008',
    id: 'tch-008',
    email: 'vikram.singh@demoschool.edu',
    firstName: 'Vikram',
    lastName: 'Singh',
    role: 'teacher',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43217',
    employeeId: 'EMP008',
    joiningDate: '2020-08-01',
    qualification: 'M.Sc. Mathematics, M.Phil.',
    subjects: [{ _id: 'sub-001', name: 'Mathematics', code: 'MATH' }],
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2020-08-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'staff-001',
    id: 'staff-001',
    email: 'meena.das@demoschool.edu',
    firstName: 'Meena',
    lastName: 'Das',
    role: 'tenant_admin',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43218',
    employeeId: 'EMP009',
    joiningDate: '2017-04-01',
    qualification: 'MBA in Education Management',
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2017-04-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'staff-002',
    id: 'staff-002',
    email: 'ravi.gupta@demoschool.edu',
    firstName: 'Ravi',
    lastName: 'Gupta',
    role: 'tenant_admin',
    tenantId: TENANT_ID,
    phoneNumber: '+91 98765 43219',
    employeeId: 'EMP010',
    joiningDate: '2019-09-01',
    qualification: 'B.Com., Tally Certified',
    isActive: true,
    isFirstLogin: false,
    isBlocked: false,
    createdAt: '2019-09-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Students (18 students across grades)
// ---------------------------------------------------------------------------
const students = [
  {
    _id: 'stu-001', id: 'stu-001', email: 'aarav.mehta@student.demoschool.edu',
    firstName: 'Aarav', lastName: 'Mehta', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0001', classId: 'cls-001', section: 'A',
    dateOfBirth: '2013-05-14', gender: 'male', bloodGroup: 'B+',
    parentEmail: 'suresh.mehta@parent.demoschool.edu', parentPhone: '+91 99001 10001',
    phoneNumber: '+91 99001 10001', address: '12, Lajpat Nagar, New Delhi',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-002', id: 'stu-002', email: 'diya.sharma@student.demoschool.edu',
    firstName: 'Diya', lastName: 'Sharma', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0002', classId: 'cls-001', section: 'A',
    dateOfBirth: '2013-08-22', gender: 'female', bloodGroup: 'O+',
    parentEmail: 'ramesh.sharma@parent.demoschool.edu', parentPhone: '+91 99001 10002',
    phoneNumber: '+91 99001 10002', address: '45, Vasant Kunj, New Delhi',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-003', id: 'stu-003', email: 'arjun.reddy@student.demoschool.edu',
    firstName: 'Arjun', lastName: 'Reddy', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0003', classId: 'cls-001', section: 'B',
    dateOfBirth: '2013-02-10', gender: 'male', bloodGroup: 'A+',
    parentEmail: 'venkat.reddy@parent.demoschool.edu', parentPhone: '+91 99001 10003',
    phoneNumber: '+91 99001 10003', address: '78, Banjara Hills, Hyderabad',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-004', id: 'stu-004', email: 'ishita.gupta@student.demoschool.edu',
    firstName: 'Ishita', lastName: 'Gupta', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0004', classId: 'cls-001', section: 'C',
    dateOfBirth: '2013-11-03', gender: 'female', bloodGroup: 'AB+',
    parentEmail: 'ajay.gupta@parent.demoschool.edu', parentPhone: '+91 99001 10004',
    phoneNumber: '+91 99001 10004', address: '23, Sector 62, Noida',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-005', id: 'stu-005', email: 'rohan.joshi@student.demoschool.edu',
    firstName: 'Rohan', lastName: 'Joshi', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0005', classId: 'cls-002', section: 'A',
    dateOfBirth: '2012-07-19', gender: 'male', bloodGroup: 'O-',
    parentEmail: 'manoj.joshi@parent.demoschool.edu', parentPhone: '+91 99001 10005',
    phoneNumber: '+91 99001 10005', address: '56, Koramangala, Bangalore',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-006', id: 'stu-006', email: 'ananya.krishnan@student.demoschool.edu',
    firstName: 'Ananya', lastName: 'Krishnan', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0006', classId: 'cls-002', section: 'A',
    dateOfBirth: '2012-03-25', gender: 'female', bloodGroup: 'A-',
    parentEmail: 'vijay.krishnan@parent.demoschool.edu', parentPhone: '+91 99001 10006',
    phoneNumber: '+91 99001 10006', address: '34, Adyar, Chennai',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-007', id: 'stu-007', email: 'kabir.khan@student.demoschool.edu',
    firstName: 'Kabir', lastName: 'Khan', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0007', classId: 'cls-002', section: 'B',
    dateOfBirth: '2012-12-01', gender: 'male', bloodGroup: 'B-',
    parentEmail: 'salim.khan@parent.demoschool.edu', parentPhone: '+91 99001 10007',
    phoneNumber: '+91 99001 10007', address: '89, Bandra West, Mumbai',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-008', id: 'stu-008', email: 'meera.nair@student.demoschool.edu',
    firstName: 'Meera', lastName: 'Nair', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0008', classId: 'cls-002', section: 'C',
    dateOfBirth: '2012-06-18', gender: 'female', bloodGroup: 'O+',
    parentEmail: 'sunil.nair@parent.demoschool.edu', parentPhone: '+91 99001 10008',
    phoneNumber: '+91 99001 10008', address: '67, Vashi, Navi Mumbai',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-009', id: 'stu-009', email: 'vivaan.desai@student.demoschool.edu',
    firstName: 'Vivaan', lastName: 'Desai', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0009', classId: 'cls-003', section: 'A',
    dateOfBirth: '2011-09-07', gender: 'male', bloodGroup: 'A+',
    parentEmail: 'nikhil.desai@parent.demoschool.edu', parentPhone: '+91 99001 10009',
    phoneNumber: '+91 99001 10009', address: '15, Satellite, Ahmedabad',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-010', id: 'stu-010', email: 'saanvi.choudhury@student.demoschool.edu',
    firstName: 'Saanvi', lastName: 'Choudhury', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0010', classId: 'cls-003', section: 'A',
    dateOfBirth: '2011-04-30', gender: 'female', bloodGroup: 'B+',
    parentEmail: 'arun.choudhury@parent.demoschool.edu', parentPhone: '+91 99001 10010',
    phoneNumber: '+91 99001 10010', address: '42, Salt Lake, Kolkata',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-011', id: 'stu-011', email: 'aditya.pillai@student.demoschool.edu',
    firstName: 'Aditya', lastName: 'Pillai', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0011', classId: 'cls-003', section: 'B',
    dateOfBirth: '2011-01-15', gender: 'male', bloodGroup: 'AB-',
    parentEmail: 'krishna.pillai@parent.demoschool.edu', parentPhone: '+91 99001 10011',
    phoneNumber: '+91 99001 10011', address: '58, MG Road, Kochi',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-012', id: 'stu-012', email: 'nisha.bhatia@student.demoschool.edu',
    firstName: 'Nisha', lastName: 'Bhatia', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0012', classId: 'cls-003', section: 'C',
    dateOfBirth: '2011-10-08', gender: 'female', bloodGroup: 'O+',
    parentEmail: 'mohan.bhatia@parent.demoschool.edu', parentPhone: '+91 99001 10012',
    phoneNumber: '+91 99001 10012', address: '91, Civil Lines, Jaipur',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-013', id: 'stu-013', email: 'dev.malhotra@student.demoschool.edu',
    firstName: 'Dev', lastName: 'Malhotra', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0013', classId: 'cls-004', section: 'A',
    dateOfBirth: '2010-06-20', gender: 'male', bloodGroup: 'B+',
    parentEmail: 'pankaj.malhotra@parent.demoschool.edu', parentPhone: '+91 99001 10013',
    phoneNumber: '+91 99001 10013', address: '14, Gomti Nagar, Lucknow',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-014', id: 'stu-014', email: 'tara.sethi@student.demoschool.edu',
    firstName: 'Tara', lastName: 'Sethi', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0014', classId: 'cls-004', section: 'A',
    dateOfBirth: '2010-02-14', gender: 'female', bloodGroup: 'A+',
    parentEmail: 'raj.sethi@parent.demoschool.edu', parentPhone: '+91 99001 10014',
    phoneNumber: '+91 99001 10014', address: '33, Aundh, Pune',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-015', id: 'stu-015', email: 'yash.chauhan@student.demoschool.edu',
    firstName: 'Yash', lastName: 'Chauhan', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0015', classId: 'cls-004', section: 'B',
    dateOfBirth: '2010-08-28', gender: 'male', bloodGroup: 'O-',
    parentEmail: 'dinesh.chauhan@parent.demoschool.edu', parentPhone: '+91 99001 10015',
    phoneNumber: '+91 99001 10015', address: '77, Vaishali Nagar, Jaipur',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-016', id: 'stu-016', email: 'prisha.rao@student.demoschool.edu',
    firstName: 'Prisha', lastName: 'Rao', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0016', classId: 'cls-004', section: 'C',
    dateOfBirth: '2010-11-12', gender: 'female', bloodGroup: 'AB+',
    parentEmail: 'sanjay.rao@parent.demoschool.edu', parentPhone: '+91 99001 10016',
    phoneNumber: '+91 99001 10016', address: '22, Indiranagar, Bangalore',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-017', id: 'stu-017', email: 'krish.thakur@student.demoschool.edu',
    firstName: 'Krish', lastName: 'Thakur', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0017', classId: 'cls-001', section: 'A',
    dateOfBirth: '2013-07-09', gender: 'male', bloodGroup: 'A+',
    parentEmail: 'harish.thakur@parent.demoschool.edu', parentPhone: '+91 99001 10017',
    phoneNumber: '+91 99001 10017', address: '55, Shimla Bypass, Shimla',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'stu-018', id: 'stu-018', email: 'siya.banerjee@student.demoschool.edu',
    firstName: 'Siya', lastName: 'Banerjee', role: 'student', tenantId: TENANT_ID,
    studentId: 'STU0018', classId: 'cls-001', section: 'B',
    dateOfBirth: '2013-12-05', gender: 'female', bloodGroup: 'B-',
    parentEmail: 'soumen.banerjee@parent.demoschool.edu', parentPhone: '+91 99001 10018',
    phoneNumber: '+91 99001 10018', address: '10, Park Street, Kolkata',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Parents
// ---------------------------------------------------------------------------
const parents = [
  {
    _id: 'par-001', id: 'par-001', email: 'suresh.mehta@parent.demoschool.edu',
    firstName: 'Suresh', lastName: 'Mehta', role: 'parent', tenantId: TENANT_ID,
    phoneNumber: '+91 99001 10001', isActive: true, isFirstLogin: false, isBlocked: false,
    children: [{ _id: 'stu-001', firstName: 'Aarav', lastName: 'Mehta', studentId: 'STU0001' }],
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'par-002', id: 'par-002', email: 'ramesh.sharma@parent.demoschool.edu',
    firstName: 'Ramesh', lastName: 'Sharma', role: 'parent', tenantId: TENANT_ID,
    phoneNumber: '+91 99001 10002', isActive: true, isFirstLogin: false, isBlocked: false,
    children: [{ _id: 'stu-002', firstName: 'Diya', lastName: 'Sharma', studentId: 'STU0002' }],
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'par-003', id: 'par-003', email: 'venkat.reddy@parent.demoschool.edu',
    firstName: 'Venkat', lastName: 'Reddy', role: 'parent', tenantId: TENANT_ID,
    phoneNumber: '+91 99001 10003', isActive: true, isFirstLogin: false, isBlocked: false,
    children: [{ _id: 'stu-003', firstName: 'Arjun', lastName: 'Reddy', studentId: 'STU0003' }],
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'par-004', id: 'par-004', email: 'ajay.gupta@parent.demoschool.edu',
    firstName: 'Ajay', lastName: 'Gupta', role: 'parent', tenantId: TENANT_ID,
    phoneNumber: '+91 99001 10004', isActive: true, isFirstLogin: false, isBlocked: false,
    children: [{ _id: 'stu-004', firstName: 'Ishita', lastName: 'Gupta', studentId: 'STU0004' }],
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
  {
    _id: 'par-005', id: 'par-005', email: 'manoj.joshi@parent.demoschool.edu',
    firstName: 'Manoj', lastName: 'Joshi', role: 'parent', tenantId: TENANT_ID,
    phoneNumber: '+91 99001 10005', isActive: true, isFirstLogin: false, isBlocked: false,
    children: [{ _id: 'stu-005', firstName: 'Rohan', lastName: 'Joshi', studentId: 'STU0005' }],
    createdAt: '2025-04-10T00:00:00.000Z', updatedAt: '2025-11-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Attendance (today's records for Grade 6-A)
// ---------------------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];

const attendanceRecords = [
  { _id: 'att-001', id: 'att-001', tenantId: TENANT_ID, studentId: 'stu-001', classId: 'cls-001', date: today, status: 'present', markedBy: 'tch-001', student: { _id: 'stu-001', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav.mehta@student.demoschool.edu', studentId: 'STU0001' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-002', id: 'att-002', tenantId: TENANT_ID, studentId: 'stu-002', classId: 'cls-001', date: today, status: 'present', markedBy: 'tch-001', student: { _id: 'stu-002', firstName: 'Diya', lastName: 'Sharma', email: 'diya.sharma@student.demoschool.edu', studentId: 'STU0002' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-003', id: 'att-003', tenantId: TENANT_ID, studentId: 'stu-003', classId: 'cls-001', date: today, status: 'absent', remarks: 'Unwell - fever', markedBy: 'tch-001', student: { _id: 'stu-003', firstName: 'Arjun', lastName: 'Reddy', email: 'arjun.reddy@student.demoschool.edu', studentId: 'STU0003' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-004', id: 'att-004', tenantId: TENANT_ID, studentId: 'stu-004', classId: 'cls-001', date: today, status: 'late', remarks: 'Arrived at 8:45 AM', markedBy: 'tch-001', student: { _id: 'stu-004', firstName: 'Ishita', lastName: 'Gupta', email: 'ishita.gupta@student.demoschool.edu', studentId: 'STU0004' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:45:00.000Z`, updatedAt: `${today}T08:45:00.000Z` },
  { _id: 'att-005', id: 'att-005', tenantId: TENANT_ID, studentId: 'stu-017', classId: 'cls-001', date: today, status: 'present', markedBy: 'tch-001', student: { _id: 'stu-017', firstName: 'Krish', lastName: 'Thakur', email: 'krish.thakur@student.demoschool.edu', studentId: 'STU0017' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-006', id: 'att-006', tenantId: TENANT_ID, studentId: 'stu-018', classId: 'cls-001', date: today, status: 'excused', remarks: 'Family function - prior approval', markedBy: 'tch-001', student: { _id: 'stu-018', firstName: 'Siya', lastName: 'Banerjee', email: 'siya.banerjee@student.demoschool.edu', studentId: 'STU0018' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-007', id: 'att-007', tenantId: TENANT_ID, studentId: 'stu-005', classId: 'cls-002', date: today, status: 'present', markedBy: 'tch-002', student: { _id: 'stu-005', firstName: 'Rohan', lastName: 'Joshi', email: 'rohan.joshi@student.demoschool.edu', studentId: 'STU0005' }, class: { _id: 'cls-002', name: 'Grade 7', grade: '7' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
  { _id: 'att-008', id: 'att-008', tenantId: TENANT_ID, studentId: 'stu-006', classId: 'cls-002', date: today, status: 'present', markedBy: 'tch-002', student: { _id: 'stu-006', firstName: 'Ananya', lastName: 'Krishnan', email: 'ananya.krishnan@student.demoschool.edu', studentId: 'STU0006' }, class: { _id: 'cls-002', name: 'Grade 7', grade: '7' }, createdAt: `${today}T08:30:00.000Z`, updatedAt: `${today}T08:30:00.000Z` },
];

// ---------------------------------------------------------------------------
// Health Records (10 records)
// ---------------------------------------------------------------------------
const healthRecords = [
  {
    _id: 'hr-001', id: 'hr-001', tenantId: TENANT_ID,
    studentId: { _id: 'stu-001', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav.mehta@student.demoschool.edu', studentId: 'STU0001' },
    bloodGroup: 'B+', height: 142, weight: 35,
    allergies: [{ type: 'FOOD', name: 'Peanuts', severity: 'Severe', notes: 'Carries epinephrine auto-injector' }],
    vaccinations: [{ name: 'Hepatitis B', doseNumber: 3, dateAdministered: '2014-01-15', status: 'COMPLETED' }, { name: 'MMR', doseNumber: 2, dateAdministered: '2015-06-20', status: 'COMPLETED' }],
    medicalConditions: [],
    emergencyContacts: [{ name: 'Suresh Mehta', relationship: 'Father', phone: '+91 99001 10001' }, { name: 'Priya Mehta', relationship: 'Mother', phone: '+91 99001 20001' }],
    primaryPhysician: 'Dr. Anil Kapoor', physicianPhone: '+91 99888 77001',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-002', id: 'hr-002', tenantId: TENANT_ID,
    studentId: { _id: 'stu-002', firstName: 'Diya', lastName: 'Sharma', email: 'diya.sharma@student.demoschool.edu', studentId: 'STU0002' },
    bloodGroup: 'O+', height: 140, weight: 33,
    allergies: [],
    vaccinations: [{ name: 'Hepatitis B', doseNumber: 3, dateAdministered: '2014-03-10', status: 'COMPLETED' }, { name: 'Varicella', doseNumber: 1, dateAdministered: '2014-09-12', status: 'COMPLETED' }],
    medicalConditions: [{ name: 'Mild Asthma', diagnosedDate: '2018-05-01', description: 'Exercise-induced asthma', treatment: 'Salbutamol inhaler as needed', isOngoing: true }],
    emergencyContacts: [{ name: 'Ramesh Sharma', relationship: 'Father', phone: '+91 99001 10002' }],
    specialInstructions: 'Keep inhaler accessible during sports activities',
    primaryPhysician: 'Dr. Swati Jain', physicianPhone: '+91 99888 77002',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-003', id: 'hr-003', tenantId: TENANT_ID,
    studentId: { _id: 'stu-003', firstName: 'Arjun', lastName: 'Reddy', email: 'arjun.reddy@student.demoschool.edu', studentId: 'STU0003' },
    bloodGroup: 'A+', height: 145, weight: 38,
    allergies: [{ type: 'MEDICINE', name: 'Penicillin', severity: 'Moderate', notes: 'Causes rash' }],
    vaccinations: [{ name: 'DPT Booster', doseNumber: 1, nextDueDate: '2026-06-01', status: 'PENDING' }],
    medicalConditions: [],
    emergencyContacts: [{ name: 'Venkat Reddy', relationship: 'Father', phone: '+91 99001 10003' }, { name: 'Lakshmi Reddy', relationship: 'Mother', phone: '+91 99001 20003' }],
    primaryPhysician: 'Dr. Prakash Rao', physicianPhone: '+91 99888 77003',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-004', id: 'hr-004', tenantId: TENANT_ID,
    studentId: { _id: 'stu-004', firstName: 'Ishita', lastName: 'Gupta', email: 'ishita.gupta@student.demoschool.edu', studentId: 'STU0004' },
    bloodGroup: 'AB+', height: 138, weight: 32,
    allergies: [{ type: 'ENVIRONMENTAL', name: 'Dust mites', severity: 'Mild', notes: 'Seasonal allergies' }],
    vaccinations: [{ name: 'Hepatitis B', doseNumber: 3, dateAdministered: '2014-05-20', status: 'COMPLETED' }],
    medicalConditions: [],
    emergencyContacts: [{ name: 'Ajay Gupta', relationship: 'Father', phone: '+91 99001 10004' }],
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-005', id: 'hr-005', tenantId: TENANT_ID,
    studentId: { _id: 'stu-005', firstName: 'Rohan', lastName: 'Joshi', email: 'rohan.joshi@student.demoschool.edu', studentId: 'STU0005' },
    bloodGroup: 'O-', height: 150, weight: 40,
    allergies: [],
    vaccinations: [{ name: 'Typhoid', doseNumber: 1, dateAdministered: '2023-08-10', status: 'COMPLETED' }],
    medicalConditions: [{ name: 'Color Vision Deficiency', diagnosedDate: '2020-03-15', description: 'Red-green color blindness', isOngoing: true }],
    emergencyContacts: [{ name: 'Manoj Joshi', relationship: 'Father', phone: '+91 99001 10005' }, { name: 'Sneha Joshi', relationship: 'Mother', phone: '+91 99001 20005' }],
    specialInstructions: 'Use high-contrast materials in class; avoid color-dependent tests',
    primaryPhysician: 'Dr. Neeraj Bhat', physicianPhone: '+91 99888 77005',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-006', id: 'hr-006', tenantId: TENANT_ID,
    studentId: { _id: 'stu-006', firstName: 'Ananya', lastName: 'Krishnan', email: 'ananya.krishnan@student.demoschool.edu', studentId: 'STU0006' },
    bloodGroup: 'A-', height: 148, weight: 37,
    allergies: [{ type: 'FOOD', name: 'Lactose', severity: 'Moderate', notes: 'Lactose intolerant - avoid dairy products' }],
    vaccinations: [{ name: 'HPV', doseNumber: 1, dateAdministered: '2025-01-15', status: 'COMPLETED' }, { name: 'HPV', doseNumber: 2, nextDueDate: '2026-01-15', status: 'PENDING' }],
    medicalConditions: [],
    emergencyContacts: [{ name: 'Vijay Krishnan', relationship: 'Father', phone: '+91 99001 10006' }],
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-007', id: 'hr-007', tenantId: TENANT_ID,
    studentId: { _id: 'stu-009', firstName: 'Vivaan', lastName: 'Desai', email: 'vivaan.desai@student.demoschool.edu', studentId: 'STU0009' },
    bloodGroup: 'A+', height: 155, weight: 44,
    allergies: [],
    vaccinations: [{ name: 'Hepatitis A', doseNumber: 2, dateAdministered: '2022-11-01', status: 'COMPLETED' }],
    medicalConditions: [{ name: 'ADHD', diagnosedDate: '2019-09-01', description: 'Attention deficit hyperactivity disorder - mild', treatment: 'Behavioral therapy, no medication currently', isOngoing: true }],
    emergencyContacts: [{ name: 'Nikhil Desai', relationship: 'Father', phone: '+91 99001 10009' }, { name: 'Rekha Desai', relationship: 'Mother', phone: '+91 99001 20009' }],
    specialInstructions: 'Seat near front of class; allow movement breaks every 30 minutes',
    primaryPhysician: 'Dr. Meghna Sinha', physicianPhone: '+91 99888 77007',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-008', id: 'hr-008', tenantId: TENANT_ID,
    studentId: { _id: 'stu-010', firstName: 'Saanvi', lastName: 'Choudhury', email: 'saanvi.choudhury@student.demoschool.edu', studentId: 'STU0010' },
    bloodGroup: 'B+', height: 152, weight: 41,
    allergies: [{ type: 'FOOD', name: 'Shellfish', severity: 'Severe', notes: 'Anaphylaxis risk' }],
    vaccinations: [{ name: 'Influenza', doseNumber: 1, dateAdministered: '2025-10-01', status: 'COMPLETED' }],
    medicalConditions: [],
    emergencyContacts: [{ name: 'Arun Choudhury', relationship: 'Father', phone: '+91 99001 10010' }],
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-009', id: 'hr-009', tenantId: TENANT_ID,
    studentId: { _id: 'stu-013', firstName: 'Dev', lastName: 'Malhotra', email: 'dev.malhotra@student.demoschool.edu', studentId: 'STU0013' },
    bloodGroup: 'B+', height: 160, weight: 48,
    allergies: [],
    vaccinations: [{ name: 'Tdap', doseNumber: 1, dateAdministered: '2024-07-01', status: 'COMPLETED' }],
    medicalConditions: [{ name: 'Type 1 Diabetes', diagnosedDate: '2017-03-10', description: 'Insulin-dependent diabetes', treatment: 'Insulin pump therapy', isOngoing: true }],
    emergencyContacts: [{ name: 'Pankaj Malhotra', relationship: 'Father', phone: '+91 99001 10013' }, { name: 'Aarti Malhotra', relationship: 'Mother', phone: '+91 99001 20013' }],
    specialInstructions: 'Allow blood sugar checks during class; keep glucose tablets accessible; allow bathroom breaks',
    insuranceProvider: 'Star Health Insurance', insurancePolicyNumber: 'SH-2024-78901',
    primaryPhysician: 'Dr. Rajan Mehra', physicianPhone: '+91 99888 77009',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    _id: 'hr-010', id: 'hr-010', tenantId: TENANT_ID,
    studentId: { _id: 'stu-016', firstName: 'Prisha', lastName: 'Rao', email: 'prisha.rao@student.demoschool.edu', studentId: 'STU0016' },
    bloodGroup: 'AB+', height: 158, weight: 45,
    allergies: [{ type: 'MEDICINE', name: 'Ibuprofen', severity: 'Mild', notes: 'Causes stomach upset' }],
    vaccinations: [{ name: 'Meningococcal', doseNumber: 1, dateAdministered: '2025-02-15', status: 'COMPLETED' }],
    medicalConditions: [{ name: 'Myopia', diagnosedDate: '2021-08-01', description: 'Near-sightedness, wears corrective lenses', treatment: 'Prescription glasses -2.5D', isOngoing: true }],
    emergencyContacts: [{ name: 'Sanjay Rao', relationship: 'Father', phone: '+91 99001 10016' }],
    specialInstructions: 'Must wear glasses during class; seat within first two rows if possible',
    createdAt: '2025-04-15T00:00:00.000Z', updatedAt: '2025-10-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Transport - Vehicles
// ---------------------------------------------------------------------------
const vehicles = [
  {
    _id: 'veh-001', id: 'veh-001', tenantId: TENANT_ID,
    vehicleNumber: 'DL 01 AB 1234', type: 'BUS', make: 'Tata', model: 'Starbus', year: 2022,
    capacity: 42, driverName: 'Rampal Singh', driverPhone: '+91 98111 22001', driverLicense: 'DL-2020-0012345',
    assistantName: 'Gopal Yadav', assistantPhone: '+91 98111 22002',
    insuranceNumber: 'INS-BUS-2025-001', insuranceExpiry: '2026-08-15',
    lastServiceDate: '2026-02-10', nextServiceDate: '2026-05-10',
    gpsDeviceId: 'GPS-001', status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2026-02-10T00:00:00.000Z',
  },
  {
    _id: 'veh-002', id: 'veh-002', tenantId: TENANT_ID,
    vehicleNumber: 'DL 01 CD 5678', type: 'BUS', make: 'Ashok Leyland', model: 'Lynx', year: 2023,
    capacity: 50, driverName: 'Mahesh Pal', driverPhone: '+91 98111 22003', driverLicense: 'DL-2019-0067890',
    assistantName: 'Sonu Kumar', assistantPhone: '+91 98111 22004',
    insuranceNumber: 'INS-BUS-2025-002', insuranceExpiry: '2026-11-20',
    lastServiceDate: '2026-01-15', nextServiceDate: '2026-04-15',
    gpsDeviceId: 'GPS-002', status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    _id: 'veh-003', id: 'veh-003', tenantId: TENANT_ID,
    vehicleNumber: 'DL 02 EF 9012', type: 'VAN', make: 'Force', model: 'Traveller', year: 2021,
    capacity: 16, driverName: 'Naresh Bhai', driverPhone: '+91 98111 22005', driverLicense: 'DL-2018-0011223',
    insuranceNumber: 'INS-VAN-2025-001', insuranceExpiry: '2026-06-30',
    lastServiceDate: '2026-03-01', nextServiceDate: '2026-06-01',
    gpsDeviceId: 'GPS-003', status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    _id: 'veh-004', id: 'veh-004', tenantId: TENANT_ID,
    vehicleNumber: 'DL 03 GH 3456', type: 'VAN', make: 'Mahindra', model: 'Supro', year: 2020,
    capacity: 12, driverName: 'Pappu Lal', driverPhone: '+91 98111 22006', driverLicense: 'DL-2017-0044556',
    insuranceNumber: 'INS-VAN-2025-002', insuranceExpiry: '2026-04-10',
    lastServiceDate: '2025-12-20', nextServiceDate: '2026-03-20',
    gpsDeviceId: 'GPS-004', status: 'MAINTENANCE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-12-20T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Transport - Routes
// ---------------------------------------------------------------------------
const routes = [
  {
    _id: 'rte-001', id: 'rte-001', tenantId: TENANT_ID,
    name: 'Route 1 - South Delhi',
    description: 'Covers Lajpat Nagar, Vasant Kunj, Saket and surrounding areas',
    vehicleId: vehicles[0],
    stops: [
      { name: 'Lajpat Nagar Metro', address: 'Lajpat Nagar, New Delhi', pickupTime: '07:15', dropTime: '14:45', order: 1 },
      { name: 'Vasant Kunj Mall', address: 'Vasant Kunj, New Delhi', pickupTime: '07:30', dropTime: '14:30', order: 2 },
      { name: 'Saket PVR', address: 'Saket, New Delhi', pickupTime: '07:45', dropTime: '14:15', order: 3 },
      { name: 'School Gate', address: 'Demo School', pickupTime: '08:10', dropTime: '14:00', order: 4 },
    ],
    startTime: '07:15', endTime: '08:10',
    distance: 18, estimatedDuration: 55, monthlyFee: 2500,
    status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'rte-002', id: 'rte-002', tenantId: TENANT_ID,
    name: 'Route 2 - Noida',
    description: 'Covers Sector 62, Sector 18, and surrounding areas',
    vehicleId: vehicles[1],
    stops: [
      { name: 'Sector 62 Market', address: 'Sector 62, Noida', pickupTime: '07:00', dropTime: '15:00', order: 1 },
      { name: 'Sector 18 Atta Market', address: 'Sector 18, Noida', pickupTime: '07:20', dropTime: '14:40', order: 2 },
      { name: 'Botanical Garden Metro', address: 'Botanical Garden, Noida', pickupTime: '07:40', dropTime: '14:20', order: 3 },
      { name: 'School Gate', address: 'Demo School', pickupTime: '08:10', dropTime: '14:00', order: 4 },
    ],
    startTime: '07:00', endTime: '08:10',
    distance: 25, estimatedDuration: 70, monthlyFee: 3000,
    status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'rte-003', id: 'rte-003', tenantId: TENANT_ID,
    name: 'Route 3 - Dwarka',
    description: 'Covers Dwarka sectors and Janakpuri',
    vehicleId: vehicles[2],
    stops: [
      { name: 'Dwarka Sector 21 Metro', address: 'Dwarka Sector 21, New Delhi', pickupTime: '07:10', dropTime: '14:50', order: 1 },
      { name: 'Dwarka Sector 12', address: 'Dwarka Sector 12, New Delhi', pickupTime: '07:25', dropTime: '14:35', order: 2 },
      { name: 'Janakpuri West Metro', address: 'Janakpuri, New Delhi', pickupTime: '07:45', dropTime: '14:15', order: 3 },
      { name: 'School Gate', address: 'Demo School', pickupTime: '08:10', dropTime: '14:00', order: 4 },
    ],
    startTime: '07:10', endTime: '08:10',
    distance: 22, estimatedDuration: 60, monthlyFee: 2800,
    status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
];

const transportStatistics = {
  totalVehicles: 4,
  activeVehicles: 3,
  totalRoutes: 3,
  activeRoutes: 3,
  totalStudentsAssigned: 14,
};

// ---------------------------------------------------------------------------
// Leave Requests (6 records)
// ---------------------------------------------------------------------------
const leaveRequests = [
  {
    _id: 'lv-001', id: 'lv-001', tenantId: TENANT_ID,
    userId: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@demoschool.edu', role: 'teacher', employeeId: 'EMP001' },
    leaveType: 'SICK', startDate: '2026-03-25', endDate: '2026-03-26', numberOfDays: 2,
    reason: 'Fever and cold symptoms. Doctor has advised rest for two days.',
    status: 'PENDING', contactDuringLeave: '+91 98765 43210', isHalfDay: false, isActive: true,
    createdAt: '2026-03-22T08:00:00.000Z', updatedAt: '2026-03-22T08:00:00.000Z',
  },
  {
    _id: 'lv-002', id: 'lv-002', tenantId: TENANT_ID,
    userId: { _id: 'tch-003', firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@demoschool.edu', role: 'teacher', employeeId: 'EMP003' },
    leaveType: 'CASUAL', startDate: '2026-04-01', endDate: '2026-04-03', numberOfDays: 3,
    reason: 'Family wedding ceremony in Kerala. Travel required.',
    status: 'APPROVED',
    approvedBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das' },
    approvedAt: '2026-03-18T10:30:00.000Z', approverComment: 'Approved. Please share lesson plans with substitute.',
    contactDuringLeave: '+91 98765 43212', isHalfDay: false, isActive: true,
    createdAt: '2026-03-15T09:00:00.000Z', updatedAt: '2026-03-18T10:30:00.000Z',
  },
  {
    _id: 'lv-003', id: 'lv-003', tenantId: TENANT_ID,
    userId: { _id: 'tch-005', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@demoschool.edu', role: 'teacher', employeeId: 'EMP005' },
    leaveType: 'EARNED', startDate: '2026-04-14', endDate: '2026-04-18', numberOfDays: 5,
    reason: 'Family vacation planned during school break week.',
    status: 'APPROVED',
    approvedBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das' },
    approvedAt: '2026-03-10T14:00:00.000Z',
    contactDuringLeave: '+91 98765 43214', isHalfDay: false, isActive: true,
    createdAt: '2026-03-05T11:00:00.000Z', updatedAt: '2026-03-10T14:00:00.000Z',
  },
  {
    _id: 'lv-004', id: 'lv-004', tenantId: TENANT_ID,
    userId: { _id: 'tch-006', firstName: 'Deepak', lastName: 'Nair', email: 'deepak.nair@demoschool.edu', role: 'teacher', employeeId: 'EMP006' },
    leaveType: 'CASUAL', startDate: '2026-03-28', endDate: '2026-03-28', numberOfDays: 1,
    reason: 'Personal work - need to visit bank and government office.',
    status: 'PENDING', contactDuringLeave: '+91 98765 43215', isHalfDay: true, halfDayType: 'SECOND_HALF',
    isActive: true,
    createdAt: '2026-03-21T16:00:00.000Z', updatedAt: '2026-03-21T16:00:00.000Z',
  },
  {
    _id: 'lv-005', id: 'lv-005', tenantId: TENANT_ID,
    userId: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@demoschool.edu', role: 'teacher', employeeId: 'EMP002' },
    leaveType: 'SICK', startDate: '2026-03-10', endDate: '2026-03-10', numberOfDays: 1,
    reason: 'Migraine attack, unable to travel.',
    status: 'REJECTED',
    approvedBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das' },
    approvedAt: '2026-03-10T09:00:00.000Z',
    approverComment: 'Please apply through proper channel at least one day in advance for non-emergency leaves. Medical certificate required for same-day sick leave.',
    isHalfDay: false, isActive: true,
    createdAt: '2026-03-10T07:30:00.000Z', updatedAt: '2026-03-10T09:00:00.000Z',
  },
  {
    _id: 'lv-006', id: 'lv-006', tenantId: TENANT_ID,
    userId: { _id: 'tch-007', firstName: 'Kavitha', lastName: 'Iyer', email: 'kavitha.iyer@demoschool.edu', role: 'teacher', employeeId: 'EMP007' },
    leaveType: 'MATERNITY', startDate: '2026-05-01', endDate: '2026-10-28', numberOfDays: 180,
    reason: 'Maternity leave as per school policy. Expected due date: May 15, 2026.',
    status: 'APPROVED',
    approvedBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das' },
    approvedAt: '2026-03-01T10:00:00.000Z', approverComment: 'Approved as per maternity leave policy. Best wishes!',
    contactDuringLeave: '+91 98765 43216', isHalfDay: false, isActive: true,
    createdAt: '2026-02-25T10:00:00.000Z', updatedAt: '2026-03-01T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Events (5 upcoming)
// ---------------------------------------------------------------------------
const events = [
  {
    _id: 'evt-001', id: 'evt-001', tenantId: TENANT_ID,
    title: 'Annual Sports Day 2026',
    description: 'Inter-house athletics competition featuring track and field events, relay races, and tug of war. All students from Grades 6-9 will participate. Parents are welcome to attend.',
    type: 'SPORTS', startDate: '2026-04-05', endDate: '2026-04-05',
    startTime: '08:00', endTime: '14:00', location: 'School Sports Ground',
    visibility: ['ALL'],
    classIds: [{ _id: 'cls-001', name: 'Grade 6', grade: '6' }, { _id: 'cls-002', name: 'Grade 7', grade: '7' }, { _id: 'cls-003', name: 'Grade 8', grade: '8' }, { _id: 'cls-004', name: 'Grade 9', grade: '9' }],
    createdBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das', role: 'tenant_admin' },
    isActive: true,
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    _id: 'evt-002', id: 'evt-002', tenantId: TENANT_ID,
    title: 'Parent-Teacher Meeting (Term 2)',
    description: 'Mid-term parent-teacher interaction to discuss student progress, areas of improvement, and future goals. Individual time slots will be shared via email.',
    type: 'MEETING', startDate: '2026-04-12', endDate: '2026-04-12',
    startTime: '09:00', endTime: '13:00', location: 'Respective Classrooms',
    visibility: ['PARENTS', 'TEACHERS'],
    createdBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das', role: 'tenant_admin' },
    isActive: true,
    createdAt: '2026-03-10T00:00:00.000Z', updatedAt: '2026-03-10T00:00:00.000Z',
  },
  {
    _id: 'evt-003', id: 'evt-003', tenantId: TENANT_ID,
    title: 'Science Exhibition',
    description: 'Annual science exhibition where students present their projects and working models. Categories include Physics, Chemistry, Biology, and Environmental Science. Best projects will be awarded.',
    type: 'ACADEMIC', startDate: '2026-04-20', endDate: '2026-04-21',
    startTime: '09:00', endTime: '15:00', location: 'School Auditorium & Labs',
    visibility: ['ALL'],
    classIds: [{ _id: 'cls-002', name: 'Grade 7', grade: '7' }, { _id: 'cls-003', name: 'Grade 8', grade: '8' }, { _id: 'cls-004', name: 'Grade 9', grade: '9' }],
    createdBy: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar', role: 'teacher' },
    isActive: true,
    createdAt: '2026-03-05T00:00:00.000Z', updatedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    _id: 'evt-004', id: 'evt-004', tenantId: TENANT_ID,
    title: 'Hindi Diwas Celebration',
    description: 'Cultural program celebrating Hindi Diwas with poetry recitation, essay writing competition, and a skit on the importance of Hindi in daily life.',
    type: 'CULTURAL', startDate: '2026-04-25', endDate: '2026-04-25',
    startTime: '10:00', endTime: '13:00', location: 'School Auditorium',
    visibility: ['STUDENTS', 'TEACHERS'],
    createdBy: { _id: 'tch-004', firstName: 'Sunita', lastName: 'Verma', role: 'teacher' },
    isActive: true,
    createdAt: '2026-03-12T00:00:00.000Z', updatedAt: '2026-03-12T00:00:00.000Z',
  },
  {
    _id: 'evt-005', id: 'evt-005', tenantId: TENANT_ID,
    title: 'Mid-Term Examinations',
    description: 'Mid-term examinations for all subjects. Detailed timetable will be shared one week prior. Syllabus coverage: up to Chapter 8 for all subjects.',
    type: 'EXAM', startDate: '2026-05-05', endDate: '2026-05-15',
    startTime: '09:00', endTime: '12:00', location: 'Examination Halls',
    visibility: ['ALL'],
    classIds: [{ _id: 'cls-001', name: 'Grade 6', grade: '6' }, { _id: 'cls-002', name: 'Grade 7', grade: '7' }, { _id: 'cls-003', name: 'Grade 8', grade: '8' }, { _id: 'cls-004', name: 'Grade 9', grade: '9' }],
    createdBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das', role: 'tenant_admin' },
    isActive: true,
    createdAt: '2026-03-15T00:00:00.000Z', updatedAt: '2026-03-15T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Fee Structures
// ---------------------------------------------------------------------------
const feeStructures = [
  {
    _id: 'fee-001', id: 'fee-001', tenantId: TENANT_ID,
    name: 'Tuition Fee - Grade 6', amount: 15000, classId: 'cls-001', academicYear: '2025-26', term: 'Term 2',
    description: 'Quarterly tuition fee for Grade 6 students', isActive: true, dueDate: '2026-04-10',
    isRecurring: true, frequency: 'quarterly',
    class: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'fee-002', id: 'fee-002', tenantId: TENANT_ID,
    name: 'Tuition Fee - Grade 7', amount: 16000, classId: 'cls-002', academicYear: '2025-26', term: 'Term 2',
    description: 'Quarterly tuition fee for Grade 7 students', isActive: true, dueDate: '2026-04-10',
    isRecurring: true, frequency: 'quarterly',
    class: { _id: 'cls-002', name: 'Grade 7', grade: '7' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'fee-003', id: 'fee-003', tenantId: TENANT_ID,
    name: 'Tuition Fee - Grade 8', amount: 17000, classId: 'cls-003', academicYear: '2025-26', term: 'Term 2',
    description: 'Quarterly tuition fee for Grade 8 students', isActive: true, dueDate: '2026-04-10',
    isRecurring: true, frequency: 'quarterly',
    class: { _id: 'cls-003', name: 'Grade 8', grade: '8' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'fee-004', id: 'fee-004', tenantId: TENANT_ID,
    name: 'Tuition Fee - Grade 9', amount: 18000, classId: 'cls-004', academicYear: '2025-26', term: 'Term 2',
    description: 'Quarterly tuition fee for Grade 9 students', isActive: true, dueDate: '2026-04-10',
    isRecurring: true, frequency: 'quarterly',
    class: { _id: 'cls-004', name: 'Grade 9', grade: '9' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'fee-005', id: 'fee-005', tenantId: TENANT_ID,
    name: 'Lab Fee', amount: 3000, classId: 'cls-003', academicYear: '2025-26', term: 'Term 2',
    description: 'Science and computer lab fee for Grade 8', isActive: true, dueDate: '2026-04-10',
    isRecurring: false,
    class: { _id: 'cls-003', name: 'Grade 8', grade: '8' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    _id: 'fee-006', id: 'fee-006', tenantId: TENANT_ID,
    name: 'Transport Fee', amount: 2500, classId: 'cls-001', academicYear: '2025-26', term: 'Term 2',
    description: 'Monthly school transport fee', isActive: true, dueDate: '2026-04-05',
    isRecurring: true, frequency: 'monthly',
    class: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Invoices (10 records)
// ---------------------------------------------------------------------------
const invoices = [
  {
    _id: 'inv-001', id: 'inv-001', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0001', studentId: 'stu-001', classId: 'cls-001', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-001', name: 'Tuition Fee - Grade 6', amount: 15000 }, { feeStructureId: 'fee-006', name: 'Transport Fee', amount: 2500 }],
    totalAmount: 17500, paidAmount: 17500, discountAmount: 0, status: 'paid' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paidDate: '2026-03-15', paymentMethod: 'online' as const, transactionId: 'TXN-20260315-001',
    createdBy: 'staff-002',
    student: { _id: 'stu-001', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav.mehta@student.demoschool.edu', studentId: 'STU0001' },
    class: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    _id: 'inv-002', id: 'inv-002', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0002', studentId: 'stu-002', classId: 'cls-001', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-001', name: 'Tuition Fee - Grade 6', amount: 15000 }],
    totalAmount: 15000, paidAmount: 15000, discountAmount: 0, status: 'paid' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paidDate: '2026-03-10', paymentMethod: 'bank_transfer' as const, transactionId: 'TXN-20260310-002',
    createdBy: 'staff-002',
    student: { _id: 'stu-002', firstName: 'Diya', lastName: 'Sharma', email: 'diya.sharma@student.demoschool.edu', studentId: 'STU0002' },
    class: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-10T00:00:00.000Z',
  },
  {
    _id: 'inv-003', id: 'inv-003', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0003', studentId: 'stu-003', classId: 'cls-001', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-001', name: 'Tuition Fee - Grade 6', amount: 15000 }],
    totalAmount: 15000, paidAmount: 0, discountAmount: 0, status: 'pending' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10',
    createdBy: 'staff-002',
    student: { _id: 'stu-003', firstName: 'Arjun', lastName: 'Reddy', email: 'arjun.reddy@student.demoschool.edu', studentId: 'STU0003' },
    class: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    _id: 'inv-004', id: 'inv-004', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0004', studentId: 'stu-005', classId: 'cls-002', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-002', name: 'Tuition Fee - Grade 7', amount: 16000 }],
    totalAmount: 16000, paidAmount: 8000, discountAmount: 0, status: 'partial' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paymentMethod: 'cash' as const,
    remarks: 'First installment paid, remaining due by April 10',
    createdBy: 'staff-002',
    student: { _id: 'stu-005', firstName: 'Rohan', lastName: 'Joshi', email: 'rohan.joshi@student.demoschool.edu', studentId: 'STU0005' },
    class: { _id: 'cls-002', name: 'Grade 7', grade: '7' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-12T00:00:00.000Z',
  },
  {
    _id: 'inv-005', id: 'inv-005', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0005', studentId: 'stu-009', classId: 'cls-003', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-003', name: 'Tuition Fee - Grade 8', amount: 17000 }, { feeStructureId: 'fee-005', name: 'Lab Fee', amount: 3000 }],
    totalAmount: 20000, paidAmount: 20000, discountAmount: 0, status: 'paid' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paidDate: '2026-03-05', paymentMethod: 'online' as const, transactionId: 'TXN-20260305-005',
    createdBy: 'staff-002',
    student: { _id: 'stu-009', firstName: 'Vivaan', lastName: 'Desai', email: 'vivaan.desai@student.demoschool.edu', studentId: 'STU0009' },
    class: { _id: 'cls-003', name: 'Grade 8', grade: '8' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    _id: 'inv-006', id: 'inv-006', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0006', studentId: 'stu-013', classId: 'cls-004', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-004', name: 'Tuition Fee - Grade 9', amount: 18000 }],
    totalAmount: 18000, paidAmount: 0, discountAmount: 0, status: 'pending' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10',
    createdBy: 'staff-002',
    student: { _id: 'stu-013', firstName: 'Dev', lastName: 'Malhotra', email: 'dev.malhotra@student.demoschool.edu', studentId: 'STU0013' },
    class: { _id: 'cls-004', name: 'Grade 9', grade: '9' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    _id: 'inv-007', id: 'inv-007', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2025-0045', studentId: 'stu-007', classId: 'cls-002', academicYear: '2025-26', term: 'Term 1',
    items: [{ feeStructureId: 'fee-002', name: 'Tuition Fee - Grade 7', amount: 16000 }],
    totalAmount: 16000, paidAmount: 0, discountAmount: 0, status: 'overdue' as const,
    issueDate: '2025-10-01', dueDate: '2025-11-15',
    remarks: 'Multiple reminders sent. Parent contacted on Dec 15.',
    createdBy: 'staff-002',
    student: { _id: 'stu-007', firstName: 'Kabir', lastName: 'Khan', email: 'kabir.khan@student.demoschool.edu', studentId: 'STU0007' },
    class: { _id: 'cls-002', name: 'Grade 7', grade: '7' },
    createdAt: '2025-10-01T00:00:00.000Z', updatedAt: '2025-12-15T00:00:00.000Z',
  },
  {
    _id: 'inv-008', id: 'inv-008', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0007', studentId: 'stu-014', classId: 'cls-004', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-004', name: 'Tuition Fee - Grade 9', amount: 18000 }],
    totalAmount: 18000, paidAmount: 18000, discountAmount: 1000, discountReason: 'Sibling discount',
    status: 'paid' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paidDate: '2026-03-08', paymentMethod: 'cheque' as const, transactionId: 'CHQ-445566',
    createdBy: 'staff-002',
    student: { _id: 'stu-014', firstName: 'Tara', lastName: 'Sethi', email: 'tara.sethi@student.demoschool.edu', studentId: 'STU0014' },
    class: { _id: 'cls-004', name: 'Grade 9', grade: '9' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-08T00:00:00.000Z',
  },
  {
    _id: 'inv-009', id: 'inv-009', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2025-0050', studentId: 'stu-011', classId: 'cls-003', academicYear: '2025-26', term: 'Term 1',
    items: [{ feeStructureId: 'fee-003', name: 'Tuition Fee - Grade 8', amount: 17000 }],
    totalAmount: 17000, paidAmount: 0, discountAmount: 0, status: 'overdue' as const,
    issueDate: '2025-10-01', dueDate: '2025-11-15',
    createdBy: 'staff-002',
    student: { _id: 'stu-011', firstName: 'Aditya', lastName: 'Pillai', email: 'aditya.pillai@student.demoschool.edu', studentId: 'STU0011' },
    class: { _id: 'cls-003', name: 'Grade 8', grade: '8' },
    createdAt: '2025-10-01T00:00:00.000Z', updatedAt: '2025-12-20T00:00:00.000Z',
  },
  {
    _id: 'inv-010', id: 'inv-010', tenantId: TENANT_ID,
    invoiceNumber: 'INV-2026-0008', studentId: 'stu-010', classId: 'cls-003', academicYear: '2025-26', term: 'Term 2',
    items: [{ feeStructureId: 'fee-003', name: 'Tuition Fee - Grade 8', amount: 17000 }, { feeStructureId: 'fee-005', name: 'Lab Fee', amount: 3000 }],
    totalAmount: 20000, paidAmount: 20000, discountAmount: 0, status: 'paid' as const,
    issueDate: '2026-03-01', dueDate: '2026-04-10', paidDate: '2026-03-02', paymentMethod: 'card' as const, transactionId: 'TXN-20260302-010',
    createdBy: 'staff-002',
    student: { _id: 'stu-010', firstName: 'Saanvi', lastName: 'Choudhury', email: 'saanvi.choudhury@student.demoschool.edu', studentId: 'STU0010' },
    class: { _id: 'cls-003', name: 'Grade 8', grade: '8' },
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-02T00:00:00.000Z',
  },
];

const invoiceStats = {
  total: 10,
  pending: 2,
  paid: 5,
  partial: 1,
  overdue: 2,
  totalAmount: 172500,
  totalPaid: 106500,
  totalPending: 66000,
};

// ---------------------------------------------------------------------------
// Timetable (Grade 6-A, Monday through Friday)
// ---------------------------------------------------------------------------
const timetableSlots = [
  // Monday
  { _id: 'tt-001', id: 'tt-001', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-001', teacherId: 'tch-001', day: 'monday', period: 1, startTime: '08:30', endTime: '09:15', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-001', name: 'Mathematics', code: 'MATH' }, teacher: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-002', id: 'tt-002', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-003', teacherId: 'tch-003', day: 'monday', period: 2, startTime: '09:15', endTime: '10:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-003', name: 'English', code: 'ENG' }, teacher: { _id: 'tch-003', firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-003', id: 'tt-003', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-002', teacherId: 'tch-002', day: 'monday', period: 3, startTime: '10:15', endTime: '11:00', roomNumber: 'Science Lab 1', isActive: true, subject: { _id: 'sub-002', name: 'Science', code: 'SCI' }, teacher: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-004', id: 'tt-004', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-004', teacherId: 'tch-004', day: 'monday', period: 4, startTime: '11:00', endTime: '11:45', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-004', name: 'Hindi', code: 'HIN' }, teacher: { _id: 'tch-004', firstName: 'Sunita', lastName: 'Verma', email: 'sunita.verma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-005', id: 'tt-005', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-005', teacherId: 'tch-005', day: 'monday', period: 5, startTime: '12:30', endTime: '13:15', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-005', name: 'Social Studies', code: 'SST' }, teacher: { _id: 'tch-005', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-006', id: 'tt-006', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-006', teacherId: 'tch-006', day: 'monday', period: 6, startTime: '13:15', endTime: '14:00', roomNumber: 'Computer Lab', isActive: true, subject: { _id: 'sub-006', name: 'Computer Science', code: 'CS' }, teacher: { _id: 'tch-006', firstName: 'Deepak', lastName: 'Nair', email: 'deepak.nair@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  // Tuesday
  { _id: 'tt-007', id: 'tt-007', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-002', teacherId: 'tch-002', day: 'tuesday', period: 1, startTime: '08:30', endTime: '09:15', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-002', name: 'Science', code: 'SCI' }, teacher: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-008', id: 'tt-008', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-001', teacherId: 'tch-001', day: 'tuesday', period: 2, startTime: '09:15', endTime: '10:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-001', name: 'Mathematics', code: 'MATH' }, teacher: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-009', id: 'tt-009', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-004', teacherId: 'tch-004', day: 'tuesday', period: 3, startTime: '10:15', endTime: '11:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-004', name: 'Hindi', code: 'HIN' }, teacher: { _id: 'tch-004', firstName: 'Sunita', lastName: 'Verma', email: 'sunita.verma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-010', id: 'tt-010', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-003', teacherId: 'tch-003', day: 'tuesday', period: 4, startTime: '11:00', endTime: '11:45', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-003', name: 'English', code: 'ENG' }, teacher: { _id: 'tch-003', firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-011', id: 'tt-011', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-006', teacherId: 'tch-006', day: 'tuesday', period: 5, startTime: '12:30', endTime: '13:15', roomNumber: 'Computer Lab', isActive: true, subject: { _id: 'sub-006', name: 'Computer Science', code: 'CS' }, teacher: { _id: 'tch-006', firstName: 'Deepak', lastName: 'Nair', email: 'deepak.nair@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-012', id: 'tt-012', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-005', teacherId: 'tch-005', day: 'tuesday', period: 6, startTime: '13:15', endTime: '14:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-005', name: 'Social Studies', code: 'SST' }, teacher: { _id: 'tch-005', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  // Wednesday
  { _id: 'tt-013', id: 'tt-013', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-003', teacherId: 'tch-003', day: 'wednesday', period: 1, startTime: '08:30', endTime: '09:15', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-003', name: 'English', code: 'ENG' }, teacher: { _id: 'tch-003', firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-014', id: 'tt-014', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-002', teacherId: 'tch-002', day: 'wednesday', period: 2, startTime: '09:15', endTime: '10:00', roomNumber: 'Science Lab 1', isActive: true, subject: { _id: 'sub-002', name: 'Science', code: 'SCI' }, teacher: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-015', id: 'tt-015', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-001', teacherId: 'tch-001', day: 'wednesday', period: 3, startTime: '10:15', endTime: '11:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-001', name: 'Mathematics', code: 'MATH' }, teacher: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-016', id: 'tt-016', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-005', teacherId: 'tch-005', day: 'wednesday', period: 4, startTime: '11:00', endTime: '11:45', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-005', name: 'Social Studies', code: 'SST' }, teacher: { _id: 'tch-005', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-017', id: 'tt-017', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-004', teacherId: 'tch-004', day: 'wednesday', period: 5, startTime: '12:30', endTime: '13:15', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-004', name: 'Hindi', code: 'HIN' }, teacher: { _id: 'tch-004', firstName: 'Sunita', lastName: 'Verma', email: 'sunita.verma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
  { _id: 'tt-018', id: 'tt-018', tenantId: TENANT_ID, classId: 'cls-001', section: 'A', subjectId: 'sub-001', teacherId: 'tch-001', day: 'wednesday', period: 6, startTime: '13:15', endTime: '14:00', roomNumber: 'Room 101', isActive: true, subject: { _id: 'sub-001', name: 'Mathematics', code: 'MATH' }, teacher: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@demoschool.edu' }, class: { _id: 'cls-001', name: 'Grade 6', grade: '6' }, createdAt: '2025-04-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' },
];

// ---------------------------------------------------------------------------
// Homework (5 entries)
// ---------------------------------------------------------------------------
const homeworkList = [
  {
    _id: 'hw-001', id: 'hw-001', tenantId: TENANT_ID,
    title: 'Algebraic Expressions - Practice Set 5',
    description: 'Complete exercises 5.1 to 5.4 from NCERT Mathematics textbook. Show all working steps clearly.',
    type: 'HOMEWORK',
    classId: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    subjectId: { _id: 'sub-001', name: 'Mathematics', code: 'MATH' },
    teacherId: { _id: 'tch-001', firstName: 'Anita', lastName: 'Sharma' },
    dueDate: '2026-03-28', maxScore: 20, attachments: [],
    instructions: 'Use A4 sheets. Write the question number clearly. Attempt all questions.',
    allowLateSubmission: true, latePenaltyPercent: 10,
    status: 'PUBLISHED', publishedAt: '2026-03-20T09:00:00.000Z',
    createdAt: '2026-03-20T09:00:00.000Z', updatedAt: '2026-03-20T09:00:00.000Z',
  },
  {
    _id: 'hw-002', id: 'hw-002', tenantId: TENANT_ID,
    title: 'Essay: My Favourite Festival',
    description: 'Write an essay of 300-400 words about your favourite Indian festival. Include cultural significance and personal experiences.',
    type: 'ASSIGNMENT',
    classId: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    subjectId: { _id: 'sub-003', name: 'English', code: 'ENG' },
    teacherId: { _id: 'tch-003', firstName: 'Priya', lastName: 'Menon' },
    dueDate: '2026-03-30', maxScore: 25, attachments: [],
    instructions: 'Handwritten on ruled paper. Focus on grammar, vocabulary, and structure.',
    allowLateSubmission: false,
    status: 'PUBLISHED', publishedAt: '2026-03-21T10:00:00.000Z',
    createdAt: '2026-03-21T10:00:00.000Z', updatedAt: '2026-03-21T10:00:00.000Z',
  },
  {
    _id: 'hw-003', id: 'hw-003', tenantId: TENANT_ID,
    title: 'Science Project: Plant Growth Observation',
    description: 'Plant a seed and observe its growth over 10 days. Maintain a daily log with drawings/photos and measurements.',
    type: 'PROJECT',
    classId: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    subjectId: { _id: 'sub-002', name: 'Science', code: 'SCI' },
    teacherId: { _id: 'tch-002', firstName: 'Rajesh', lastName: 'Kumar' },
    dueDate: '2026-04-05', maxScore: 30, attachments: [],
    instructions: 'Use any seed (mustard, fenugreek, or beans). Record daily: height, number of leaves, water given. Include at least 3 photos.',
    allowLateSubmission: true, latePenaltyPercent: 20,
    status: 'PUBLISHED', publishedAt: '2026-03-18T11:00:00.000Z',
    createdAt: '2026-03-18T11:00:00.000Z', updatedAt: '2026-03-18T11:00:00.000Z',
  },
  {
    _id: 'hw-004', id: 'hw-004', tenantId: TENANT_ID,
    title: 'Hindi Kavita Vachan (Poetry Recitation)',
    description: 'Learn and practice reciting the poem "Veer Tum Badhe Chalo" by Shri Ram Sharma. Be prepared for in-class recitation.',
    type: 'PRACTICE',
    classId: { _id: 'cls-001', name: 'Grade 6', grade: '6' },
    subjectId: { _id: 'sub-004', name: 'Hindi', code: 'HIN' },
    teacherId: { _id: 'tch-004', firstName: 'Sunita', lastName: 'Verma' },
    dueDate: '2026-03-26', attachments: [],
    instructions: 'Practice proper pronunciation and intonation. Memorise the first 3 stanzas at minimum.',
    allowLateSubmission: false,
    status: 'PUBLISHED', publishedAt: '2026-03-19T08:30:00.000Z',
    createdAt: '2026-03-19T08:30:00.000Z', updatedAt: '2026-03-19T08:30:00.000Z',
  },
  {
    _id: 'hw-005', id: 'hw-005', tenantId: TENANT_ID,
    title: 'Map Work: Rivers of India',
    description: 'On a physical map of India, mark and label all major rivers: Ganga, Yamuna, Brahmaputra, Godavari, Krishna, Narmada, Tapti, Kaveri, Mahanadi, and Indus.',
    type: 'HOMEWORK',
    classId: { _id: 'cls-002', name: 'Grade 7', grade: '7' },
    subjectId: { _id: 'sub-005', name: 'Social Studies', code: 'SST' },
    teacherId: { _id: 'tch-005', firstName: 'Amit', lastName: 'Patel' },
    dueDate: '2026-03-29', maxScore: 15, attachments: [],
    instructions: 'Use coloured pencils. Mark the origin and mouth of each river. Label neatly.',
    allowLateSubmission: true, latePenaltyPercent: 15,
    status: 'PUBLISHED', publishedAt: '2026-03-20T14:00:00.000Z',
    createdAt: '2026-03-20T14:00:00.000Z', updatedAt: '2026-03-20T14:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Announcements (3 entries)
// ---------------------------------------------------------------------------
const announcements = [
  {
    _id: 'ann-001', id: 'ann-001',
    title: 'Summer Uniform Switch - Effective April 1st',
    message: 'Dear parents and students, please note that the school will switch to summer uniforms starting April 1, 2026. Students are expected to wear the prescribed summer uniform (light blue shirt, grey trousers/skirt) from this date onwards. Winter uniforms will not be permitted after March 31. Please ensure your child has the summer uniform ready.',
    target: 'ALL' as const, priority: 'NORMAL' as const, status: 'SENT' as const,
    createdBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das', email: 'meena.das@demoschool.edu' },
    sentAt: '2026-03-20T08:00:00.000Z', readCount: 45, isActive: true,
    createdAt: '2026-03-20T08:00:00.000Z', updatedAt: '2026-03-22T12:00:00.000Z',
  },
  {
    _id: 'ann-002', id: 'ann-002',
    title: 'Annual Sports Day Registration Open',
    message: 'Registrations for the Annual Sports Day on April 5, 2026 are now open. Students can register for up to 3 individual events and 1 team event through their class teachers. Last date for registration: March 28, 2026. Events include 100m, 200m, long jump, high jump, shot put, relay, and tug of war. Participation certificates for all; medals and trophies for top 3.',
    target: 'ALL' as const, priority: 'HIGH' as const, status: 'SENT' as const,
    createdBy: { _id: 'staff-001', firstName: 'Meena', lastName: 'Das', email: 'meena.das@demoschool.edu' },
    sentAt: '2026-03-18T09:00:00.000Z', readCount: 72, isActive: true,
    createdAt: '2026-03-18T09:00:00.000Z', updatedAt: '2026-03-22T10:00:00.000Z',
  },
  {
    _id: 'ann-003', id: 'ann-003',
    title: 'Fee Payment Reminder - Term 2',
    message: 'This is a reminder that the Term 2 fees are due by April 10, 2026. Payments can be made via online transfer, UPI, cheque, or at the school accounts office. Late payment will attract a penalty of Rs. 50 per day. For any queries or requests for fee concession, please contact the accounts department at accounts@demoschool.edu.',
    target: 'ALL' as const, priority: 'URGENT' as const, status: 'SENT' as const,
    createdBy: { _id: 'staff-002', firstName: 'Ravi', lastName: 'Gupta', email: 'ravi.gupta@demoschool.edu' },
    sentAt: '2026-03-22T07:00:00.000Z', readCount: 18, isActive: true, expiresAt: '2026-04-15T00:00:00.000Z',
    createdAt: '2026-03-22T07:00:00.000Z', updatedAt: '2026-03-22T07:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Superadmin Schools (6 schools for platform view)
// ---------------------------------------------------------------------------
const superadminSchools = [
  {
    _id: 'sch-001', id: 'sch-001', tenantId: 'tenant-greenvalley',
    schoolName: 'Green Valley International School', domain: 'greenvalley.allowbox.app',
    contactEmail: 'admin@greenvalley.edu.in', contactPhone: '+91 11 2345 6789',
    address: '42, Hauz Khas Village', city: 'New Delhi', state: 'Delhi', country: 'India', postalCode: '110016',
    subscriptionStatus: 'active' as const, subscriptionPlan: 'premium' as const,
    studentCount: 580, teacherCount: 42, staffCount: 15, currentUsers: 637, maxUsers: 1000,
    pricePerStudent: 120, mrr: 69600, arr: 835200, totalRevenue: 418000, outstandingBalance: 0,
    lastPaymentDate: '2026-03-01', nextBillingDate: '2026-04-01',
    subscriptionStartDate: '2024-08-01',
    adminId: { _id: 'adm-001', firstName: 'Pradeep', lastName: 'Malik', email: 'pradeep@greenvalley.edu.in' },
    onboardedBy: { _id: 'plt-001', firstName: 'Sales', lastName: 'Team' },
    onboardedAt: '2024-07-15', lastActivityAt: '2026-03-22T09:30:00.000Z',
    totalLogins: 3420, isActive: true,
    createdAt: '2024-07-15T00:00:00.000Z', updatedAt: '2026-03-22T09:30:00.000Z',
  },
  {
    _id: 'sch-002', id: 'sch-002', tenantId: 'tenant-sunrisepublic',
    schoolName: 'Sunrise Public School', domain: 'sunrise.allowbox.app',
    contactEmail: 'office@sunriseschool.in', contactPhone: '+91 22 3456 7890',
    address: '15, Andheri East', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400069',
    subscriptionStatus: 'active' as const, subscriptionPlan: 'basic' as const,
    studentCount: 320, teacherCount: 28, staffCount: 10, currentUsers: 358, maxUsers: 500,
    pricePerStudent: 80, mrr: 25600, arr: 307200, totalRevenue: 153600, outstandingBalance: 25600,
    lastPaymentDate: '2026-02-01', nextBillingDate: '2026-04-01',
    subscriptionStartDate: '2025-02-01',
    adminId: { _id: 'adm-002', firstName: 'Rekha', lastName: 'Patil', email: 'rekha@sunriseschool.in' },
    onboardedBy: { _id: 'plt-001', firstName: 'Sales', lastName: 'Team' },
    onboardedAt: '2025-01-20', lastActivityAt: '2026-03-21T14:20:00.000Z',
    totalLogins: 1280, isActive: true,
    createdAt: '2025-01-20T00:00:00.000Z', updatedAt: '2026-03-21T14:20:00.000Z',
  },
  {
    _id: 'sch-003', id: 'sch-003', tenantId: 'tenant-stmarys',
    schoolName: "St. Mary's Convent School", domain: 'stmarys.allowbox.app',
    contactEmail: 'principal@stmarysschool.org', contactPhone: '+91 80 4567 8901',
    address: '8, Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', country: 'India', postalCode: '560066',
    subscriptionStatus: 'active' as const, subscriptionPlan: 'enterprise' as const,
    studentCount: 1200, teacherCount: 85, staffCount: 30, currentUsers: 1315, maxUsers: 2000,
    pricePerStudent: 150, mrr: 180000, arr: 2160000, totalRevenue: 1620000, outstandingBalance: 0,
    lastPaymentDate: '2026-03-05', nextBillingDate: '2026-04-05',
    subscriptionStartDate: '2023-06-01',
    adminId: { _id: 'adm-003', firstName: 'Sister', lastName: 'Margaret', email: 'margaret@stmarysschool.org' },
    onboardedBy: { _id: 'plt-002', firstName: 'Enterprise', lastName: 'Sales' },
    onboardedAt: '2023-05-15', lastActivityAt: '2026-03-22T11:45:00.000Z',
    totalLogins: 8900, isActive: true,
    createdAt: '2023-05-15T00:00:00.000Z', updatedAt: '2026-03-22T11:45:00.000Z',
  },
  {
    _id: 'sch-004', id: 'sch-004', tenantId: 'tenant-dpsmodern',
    schoolName: 'DPS Modern Academy', domain: 'dpsmodern.allowbox.app',
    contactEmail: 'info@dpsmodern.edu.in', contactPhone: '+91 44 5678 9012',
    address: '120, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', postalCode: '600040',
    subscriptionStatus: 'trial' as const, subscriptionPlan: 'premium' as const,
    studentCount: 450, teacherCount: 35, staffCount: 12, currentUsers: 497, maxUsers: 750,
    pricePerStudent: 120, mrr: 0, arr: 0, totalRevenue: 0, outstandingBalance: 0,
    trialEndDate: '2026-04-15',
    subscriptionStartDate: '2026-03-01',
    adminId: { _id: 'adm-004', firstName: 'Lakshmi', lastName: 'Narayanan', email: 'lakshmi@dpsmodern.edu.in' },
    onboardedBy: { _id: 'plt-001', firstName: 'Sales', lastName: 'Team' },
    onboardedAt: '2026-03-01', lastActivityAt: '2026-03-22T08:15:00.000Z',
    totalLogins: 85, isActive: true,
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-22T08:15:00.000Z',
  },
  {
    _id: 'sch-005', id: 'sch-005', tenantId: 'tenant-littleflower',
    schoolName: 'Little Flower High School', domain: 'littleflower.allowbox.app',
    contactEmail: 'admin@littleflower.in', contactPhone: '+91 40 6789 0123',
    address: '55, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', postalCode: '500033',
    subscriptionStatus: 'suspended' as const, subscriptionPlan: 'basic' as const,
    studentCount: 280, teacherCount: 22, staffCount: 8, currentUsers: 310, maxUsers: 500,
    pricePerStudent: 80, mrr: 0, arr: 0, totalRevenue: 89600, outstandingBalance: 44800,
    lastPaymentDate: '2025-12-01', nextBillingDate: '2026-02-01',
    subscriptionStartDate: '2025-04-01',
    adminId: { _id: 'adm-005', firstName: 'Thomas', lastName: 'George', email: 'thomas@littleflower.in' },
    onboardedBy: { _id: 'plt-001', firstName: 'Sales', lastName: 'Team' },
    onboardedAt: '2025-03-20', lastActivityAt: '2026-01-15T16:30:00.000Z',
    totalLogins: 560, isActive: false,
    notes: 'Suspended due to non-payment. Two months outstanding. Last contacted Jan 20.',
    createdAt: '2025-03-20T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    _id: 'sch-006', id: 'sch-006', tenantId: 'tenant-vidyamandir',
    schoolName: 'Vidya Mandir Public School', domain: 'vidyamandir.allowbox.app',
    contactEmail: 'principal@vidyamandir.edu.in', contactPhone: '+91 141 789 0123',
    address: '28, C-Scheme', city: 'Jaipur', state: 'Rajasthan', country: 'India', postalCode: '302001',
    subscriptionStatus: 'active' as const, subscriptionPlan: 'premium' as const,
    studentCount: 680, teacherCount: 48, staffCount: 18, currentUsers: 746, maxUsers: 1000,
    pricePerStudent: 120, mrr: 81600, arr: 979200, totalRevenue: 489600, outstandingBalance: 0,
    lastPaymentDate: '2026-03-10', nextBillingDate: '2026-04-10',
    subscriptionStartDate: '2025-06-01',
    adminId: { _id: 'adm-006', firstName: 'Sudhir', lastName: 'Mathur', email: 'sudhir@vidyamandir.edu.in' },
    onboardedBy: { _id: 'plt-001', firstName: 'Sales', lastName: 'Team' },
    onboardedAt: '2025-05-15', lastActivityAt: '2026-03-22T10:00:00.000Z',
    totalLogins: 2150, isActive: true,
    createdAt: '2025-05-15T00:00:00.000Z', updatedAt: '2026-03-22T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Platform Users
// ---------------------------------------------------------------------------
const platformUsers = [
  {
    _id: 'plt-001', id: 'plt-001', email: 'admin@allowbox.app',
    firstName: 'Super', lastName: 'Admin', role: 'super_admin', tenantId: 'platform',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2026-03-22T00:00:00.000Z',
  },
  {
    _id: 'plt-002', id: 'plt-002', email: 'sales@allowbox.app',
    firstName: 'Rahul', lastName: 'Kapoor', role: 'sales', tenantId: 'platform',
    phoneNumber: '+91 98765 00001',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2023-06-01T00:00:00.000Z', updatedAt: '2026-03-22T00:00:00.000Z',
  },
  {
    _id: 'plt-003', id: 'plt-003', email: 'finance@allowbox.app',
    firstName: 'Neha', lastName: 'Saxena', role: 'finance', tenantId: 'platform',
    phoneNumber: '+91 98765 00002',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2024-01-15T00:00:00.000Z', updatedAt: '2026-03-22T00:00:00.000Z',
  },
  {
    _id: 'plt-004', id: 'plt-004', email: 'support@allowbox.app',
    firstName: 'Kiran', lastName: 'Deshmukh', role: 'support', tenantId: 'platform',
    phoneNumber: '+91 98765 00003',
    isActive: true, isFirstLogin: false, isBlocked: false,
    createdAt: '2024-03-01T00:00:00.000Z', updatedAt: '2026-03-22T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Tenant Info
// ---------------------------------------------------------------------------
const tenantInfo = {
  tenantId: TENANT_ID,
  schoolName: 'Demo School',
  schoolCode: 'DEMO-INT',
  domain: 'demo.allowbox.app',
  address: '123, Education Lane, Connaught Place',
  contactEmail: 'info@demoschool.edu',
  contactPhone: '+91 11 2345 0000',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  subscription: { plan: 'premium', status: 'active' },
};

// ============================================================================
// Router
// ============================================================================
export function getDemoResponse(url: string, method: string): any {
  const m = method.toUpperCase();

  // For mutation methods, return a generic success response
  if (m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE') {
    // Some POST endpoints are actually reads (like stats calculation)
    // but for demo we can still return success for true mutations
    // and handle specific read-like POSTs below
    if (!url.includes('/stats') && !url.includes('/calculate')) {
      return { success: true, message: 'Updated successfully' };
    }
  }

  // Auth
  if (url.includes('/auth/me')) {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return { user: stored ? JSON.parse(stored) : {} };
  }

  // Superadmin
  if (url.includes('/superadmin/schools/alerts/inactive')) return superadminSchools.filter(s => !s.isActive);
  if (url.includes('/superadmin/schools/alerts/expiring-trials')) return superadminSchools.filter(s => s.subscriptionStatus === 'trial');
  if (url.includes('/superadmin/schools/alerts/unpaid')) return superadminSchools.filter(s => s.outstandingBalance > 0);
  if (url.match(/\/superadmin\/schools\/[^/]+\/metrics/)) return { totalStudents: 580, totalTeachers: 42, totalStaff: 15, activeUsers: 520, monthlyRevenue: 69600, attendanceRate: 94.2 };
  if (url.match(/\/superadmin\/schools\/[^/]+\/calculate-mrr/)) return { mrr: 69600, arr: 835200 };
  if (url.match(/\/superadmin\/schools\/[^/]+/)) {
    const id = url.split('/superadmin/schools/')[1]?.split('?')[0];
    return superadminSchools.find(s => s._id === id) || superadminSchools[0];
  }
  if (url.includes('/superadmin/schools')) return superadminSchools;

  // Platform users
  if (url.includes('/users/platform')) return platformUsers;

  // Users by role
  if (url.includes('/users/by-role') || url.includes('/users?role=')) {
    if (url.includes('role=student')) return students;
    if (url.includes('role=teacher')) return teachers.filter(t => t.role === 'teacher');
    if (url.includes('role=parent')) return parents;
    if (url.includes('role=tenant_admin')) return teachers.filter(t => t.role === 'tenant_admin');
    return [...students, ...teachers, ...parents];
  }

  // Individual user by ID
  if (url.match(/\/users\/[a-z]+-\d+$/)) {
    const id = url.split('/users/')[1]?.split('?')[0];
    const allUsers = [...students, ...teachers, ...parents, ...platformUsers];
    return allUsers.find(u => u._id === id || u.id === id) || allUsers[0];
  }

  // Users (generic)
  if (url.includes('/users')) return [...students, ...teachers, ...parents];

  // Classes
  if (url.match(/\/classes\/[^/]+/)) {
    const id = url.split('/classes/')[1]?.split('?')[0];
    return classes.find(c => c._id === id) || classes[0];
  }
  if (url.includes('/classes')) return classes;

  // Subjects
  if (url.match(/\/subjects\/[^/]+/)) {
    const id = url.split('/subjects/')[1]?.split('?')[0];
    return subjects.find(s => s._id === id) || subjects[0];
  }
  if (url.includes('/subjects')) return subjects;

  // Attendance
  if (url.includes('/attendance/by-class')) return attendanceRecords;
  if (url.includes('/attendance/by-student')) return attendanceRecords.slice(0, 3);
  if (url.includes('/attendance')) return attendanceRecords;

  // Health records
  if (url.includes('/health-records/vaccination-alerts')) return healthRecords.filter(hr => hr.vaccinations.some(v => v.status === 'PENDING'));
  if (url.includes('/health-records/medical-alerts')) return healthRecords.filter(hr => hr.medicalConditions.length > 0);
  if (url.match(/\/health-records\/student\/[^/]+/)) {
    const studentId = url.split('/health-records/student/')[1]?.split('?')[0];
    return healthRecords.find(hr => hr.studentId._id === studentId) || healthRecords[0];
  }
  if (url.match(/\/health-records\/[^/]+/) && !url.includes('/health-records/vaccination') && !url.includes('/health-records/medical')) {
    const id = url.split('/health-records/')[1]?.split('?')[0];
    return healthRecords.find(hr => hr._id === id) || healthRecords[0];
  }
  if (url.includes('/health-records')) return healthRecords;

  // Transport
  if (url.includes('/transport/statistics')) return transportStatistics;
  if (url.includes('/transport/vehicles')) {
    if (url.match(/\/transport\/vehicles\/[^/]+/)) {
      const id = url.split('/transport/vehicles/')[1]?.split('?')[0];
      return vehicles.find(v => v._id === id) || vehicles[0];
    }
    return vehicles;
  }
  if (url.includes('/transport/routes')) {
    if (url.match(/\/transport\/routes\/[^/]+\/students/)) return [];
    if (url.match(/\/transport\/routes\/[^/]+/)) {
      const id = url.split('/transport/routes/')[1]?.split('?')[0];
      return routes.find(r => r._id === id) || routes[0];
    }
    return routes;
  }
  if (url.includes('/transport/assignments')) return [];
  if (url.includes('/transport')) return { vehicles, routes, assignments: [] };

  // Leave requests
  if (url.includes('/leave-requests/my-requests')) return leaveRequests.slice(0, 3);
  if (url.includes('/leave-requests/pending')) return leaveRequests.filter(l => l.status === 'PENDING');
  if (url.includes('/leave-requests/my-stats')) return { totalDays: 8, byType: { SICK: 2, CASUAL: 3, EARNED: 3, MATERNITY: 0, PATERNITY: 0, UNPAID: 0, OTHER: 0 } };
  if (url.includes('/leave-requests/calendar')) return leaveRequests.filter(l => l.status === 'APPROVED');
  if (url.match(/\/leave-requests\/[^/]+/)) {
    const id = url.split('/leave-requests/')[1]?.split('?')[0]?.split('/')[0];
    return leaveRequests.find(l => l._id === id) || leaveRequests[0];
  }
  if (url.includes('/leave-requests')) return leaveRequests;

  // Events
  if (url.includes('/events/upcoming')) return events;
  if (url.includes('/events/calendar')) return events;
  if (url.match(/\/events\/[^/]+/)) {
    const id = url.split('/events/')[1]?.split('?')[0];
    return events.find(e => e._id === id) || events[0];
  }
  if (url.includes('/events')) return events;

  // Fees
  if (url.includes('/fees/invoices/stats')) return invoiceStats;
  if (url.match(/\/fees\/invoices\/number\//)) return invoices[0];
  if (url.match(/\/fees\/invoices\/[^/]+/) && !url.includes('/stats')) {
    const id = url.split('/fees/invoices/')[1]?.split('?')[0];
    return invoices.find(i => i._id === id) || invoices[0];
  }
  if (url.includes('/fees/invoices')) return invoices;
  if (url.match(/\/fees\/structures\/[^/]+/)) {
    const id = url.split('/fees/structures/')[1]?.split('?')[0];
    return feeStructures.find(f => f._id === id) || feeStructures[0];
  }
  if (url.includes('/fees/structures')) return feeStructures;
  if (url.includes('/fees')) return feeStructures;

  // Timetable
  if (url.includes('/timetable/by-class')) return timetableSlots;
  if (url.includes('/timetable/by-teacher')) return timetableSlots.filter(t => t.teacherId === 'tch-001');
  if (url.match(/\/timetable\/[^/]+/) && !url.includes('/by-')) {
    const id = url.split('/timetable/')[1]?.split('?')[0];
    return timetableSlots.find(t => t._id === id) || timetableSlots[0];
  }
  if (url.includes('/timetable')) return timetableSlots;

  // Homework
  if (url.includes('/homework/my-assignments')) return homeworkList;
  if (url.includes('/homework/submissions')) return [];
  if (url.match(/\/homework\/[^/]+\/submissions/)) return [];
  if (url.match(/\/homework\/[^/]+\/statistics/)) return { totalStudents: 25, submitted: 18, pending: 7, graded: 12, averageScore: 78.5 };
  if (url.match(/\/homework\/class\//)) return homeworkList;
  if (url.match(/\/homework\/[^/]+/) && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/class') && !url.includes('/my-')) {
    const id = url.split('/homework/')[1]?.split('?')[0];
    return homeworkList.find(h => h._id === id) || homeworkList[0];
  }
  if (url.includes('/homework')) return homeworkList;

  // Announcements
  if (url.includes('/announcements/for-tenant')) return announcements;
  if (url.includes('/announcements/stats')) return { total: 3, sent: 3, scheduled: 0, byTarget: { ALL: 3 } };
  if (url.match(/\/announcements\/[^/]+/) && !url.includes('/for-tenant') && !url.includes('/stats')) {
    const id = url.split('/announcements/')[1]?.split('?')[0];
    return announcements.find(a => a._id === id) || announcements[0];
  }
  if (url.includes('/announcements')) return announcements;

  // Tenant
  if (url.includes('/tenants/me') || url.includes('/tenants')) return tenantInfo;

  // Exams, marks, grades
  if (url.includes('/exams') || url.includes('/marks') || url.includes('/grades')) return [];

  // Messages
  if (url.includes('/messages')) return [];

  // Daily diary
  if (url.includes('/daily-diary')) return [];

  // Lesson plans
  if (url.includes('/lesson-plans')) return [];

  // Activity logs
  if (url.includes('/activity-logs')) return [];

  // Support tickets
  if (url.includes('/support-tickets')) return [];

  // Inventory
  if (url.includes('/inventory')) return [];

  // Fallback
  return [];
}
