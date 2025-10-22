# Role-Based Routing

This document explains how users are redirected to their appropriate dashboards based on their role after login.

## Overview

After successful login, users are automatically redirected to their role-specific dashboard. The system maps backend user roles to frontend dashboard routes.

## Role to Dashboard Mapping

| Backend Role | Frontend Route | Dashboard Folder | Description |
|-------------|----------------|------------------|-------------|
| `super_admin` | `/platform` | `(platform)` | Platform/Super admin dashboard |
| `tenant_admin` | `/school` | `(school)` | School admin dashboard |
| `school_admin` | `/school` | `(school)` | School admin dashboard (alias) |
| `teacher` | `/teacher` | `(teacher)` | Teacher dashboard |
| `parent` | `/parent` | `(parent)` | Parent dashboard |
| `student` | `/parent` | `(parent)` | Students use parent dashboard |

## How It Works

### 1. Login Process
When a user logs in at `/auth/login`:
1. Credentials are sent to the backend
2. Backend validates and returns user data with role
3. Auth context updates with user information
4. Login page detects user data and redirects based on role

### 2. Role Detection
```typescript
const userRole = user.roles?.[0] || 'tenant_admin';
const dashboardPath = ROLE_DASHBOARDS[userRole] || '/school';
router.push(dashboardPath);
```

### 3. Configuration Location
Role mappings are defined in:
- **File**: `/packages/config/src/index.ts`
- **Constant**: `ROLE_DASHBOARDS`

```typescript
export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: ROUTES.PLATFORM_DASHBOARD,      // /platform
  [ROLES.SCHOOL_ADMIN]: ROUTES.SCHOOL_DASHBOARD,       // /school
  [ROLES.TENANT_ADMIN]: ROUTES.SCHOOL_DASHBOARD,       // /school
  [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,           // /teacher
  [ROLES.PARENT]: ROUTES.PARENT_DASHBOARD,             // /parent
  [ROLES.STUDENT]: ROUTES.PARENT_DASHBOARD,            // /parent
} as const;
```

## Dashboard Features by Role

### Super Admin (`/platform`)
- Manage all schools/tenants
- View platform-wide analytics
- Manage subscriptions and billing
- Create new schools

### School Admin (`/school`)
- Manage school settings
- Create/manage students
- Create/manage staff (teachers)
- View school analytics
- Manage classes and subjects

### Teacher (`/teacher`)
- View assigned classes
- Mark attendance
- Assign homework
- View student performance
- Communicate with parents

### Parent (`/parent`)
- View children's information
- Track attendance and grades
- Pay fees
- Communicate with teachers
- View school announcements

## Default Passwords

For newly created users:

| User Type | Default Password |
|-----------|-----------------|
| **Students** | `student123` |
| **Teachers/Staff** | `teacher123` |
| **Super Admin** | `Admin@123` |

## Adding New Roles

To add a new role:

1. **Update Config** (`/packages/config/src/index.ts`):
   ```typescript
   export const ROLES = {
     // ... existing roles
     NEW_ROLE: 'new_role',
   };
   ```

2. **Add Route**:
   ```typescript
   export const ROUTES = {
     // ... existing routes
     NEW_ROLE_DASHBOARD: '/new-role',
   };
   ```

3. **Map Role to Dashboard**:
   ```typescript
   export const ROLE_DASHBOARDS = {
     // ... existing mappings
     [ROLES.NEW_ROLE]: ROUTES.NEW_ROLE_DASHBOARD,
   };
   ```

4. **Create Dashboard Folder**:
   ```
   /app/(new-role)/new-role/page.tsx
   ```

## Protected Routes

Each dashboard folder uses Next.js route groups (parentheses) to organize routes without affecting the URL structure.

### Folder Structure
```
app/
├── (platform)/        # Super admin routes
│   ├── platform/
│   └── schools/
├── (school)/          # School admin routes
│   ├── school/
│   ├── students/
│   └── staff/
├── (teacher)/         # Teacher routes
│   ├── teacher/
│   └── classes/
└── (parent)/          # Parent/Student routes
    ├── parent/
    └── children/
```

## Testing

### Test Login with Different Roles

1. **Super Admin**:
   - Email: `admin@allowbox.app`
   - Password: `Admin@123`
   - Should redirect to: `/platform`

2. **School Admin**:
   - Create via signup or super admin
   - Should redirect to: `/school`

3. **Teacher**:
   - Create via school admin dashboard
   - Default password: `teacher123`
   - Should redirect to: `/teacher`

4. **Parent**:
   - Create via school admin dashboard
   - Should redirect to: `/parent`

5. **Student**:
   - Create via school admin dashboard
   - Default password: `student123`
   - Should redirect to: `/parent`

## Security Notes

⚠️ **Important**:
- Default passwords should be changed on first login
- Implement password change prompts for new users
- Add route guards to verify user has access to the dashboard
- Implement session timeout and token refresh

## Troubleshooting

### User Not Redirecting
- Check that user role is correctly set in the database
- Verify auth context is updating with user data
- Check browser console for redirect logs
- Ensure dashboard page exists for the role

### Wrong Dashboard
- Verify user.roles[0] contains the correct role
- Check ROLE_DASHBOARDS mapping includes the role
- Ensure backend is returning the correct role

---

**Last Updated**: 2025-10-19
**Status**: ✅ Implemented and Ready
