# Allowbox Frontend QA Checklist (Static Flow)

Use this checklist to walk-through end-to-end flows. Tick each step as you verify. If a step fails, capture a short note and the console error.

## 1. Auth & Onboarding
- [ ] Login (Super Admin)
- [ ] Login (School Admin)
- [ ] Login (Teacher)
- [ ] Login (Parent)
- [ ] Forgot Password page opens and submits
- [ ] School Onboarding route opens

## 2. Super Admin (Platform)
- [ ] Dashboard stats render (Totals, MRR, Active/Inactive)
- [ ] Schools table loads with unique rows (no duplicates)
- [ ] Search filters the table by school name
- [ ] Add School creates a single, non-duplicated entry with unique ID
- [ ] Edit School updates Students/Teachers counts
- [ ] Assign Admin persists selection
- [ ] Disable/Enable toggles status and persists after refresh
- [ ] Finance: Revenue per School list renders
- [ ] Finance: CSV download works
- [ ] Notifications open/mark-all-read/clear behave as expected

## 3. School Admin
- [ ] Dashboard totals show counts (students/staff/classes/pending fees)
- [ ] Students page: list renders, search (name/class) works
- [ ] Add Student: numeric guards for age, creates unique student (no duplicates)
- [ ] Staff page: list renders, add staff (no duplicates)
- [ ] Classes page: classes deduplicate by name
- [ ] Fees & Billing: Pending and Recent Payments reflect invoices
- [ ] Create Invoice (Single Student): invoice appears, pending total updates
- [ ] Create Invoice (Class): one invoice per student, totals update
- [ ] Fees CSV download works (pending invoices)

## 4. Teacher
- [ ] Attendance: Date/Class labels visible
- [ ] Attendance: controls disabled when no students
- [ ] Attendance: set present/absent, saved to store
- [ ] Homework: create/edit/remove assignments for class
- [ ] Timetable: add/update entries per class

## 5. Parent
- [ ] Dashboard shows children and pending amounts
- [ ] Children: clicking child opens modal with attendance last 7 days and homework
- [ ] Fees: invoices list shows pending/paid correctly
- [ ] Pay Now marks invoice Paid; reflected in School Admin/Platform

## 6. Cross-portal data sync
- [ ] Students added by School Admin appear in Teacher attendance list
- [ ] Homework added by Teacher appears in Parent child details
- [ ] Invoices created by School Admin appear in Parent Fees and update after payment

## 7. Data Integrity
- [ ] Schools are unique by name; ID is unique and stable
- [ ] Students are unique by name+class+age
- [ ] Staff are unique by name+role
- [ ] Classes unique by name

## 8. Accessibility & UX
- [ ] Focus states visible on interactive elements
- [ ] Buttons disabled during async actions (save, create invoice)
- [ ] Meaningful banners/toasts after actions

## 9. Performance & Errors
- [ ] No console errors on route transitions
- [ ] Lists render smoothly; no layout shifts
- [ ] Large lists are responsive

## 10. Regression checklist
- [ ] No duplicated entries after reload
- [ ] Store subscriptions keep pages in sync across tabs
- [ ] Negative numbers blocked in numeric fields
