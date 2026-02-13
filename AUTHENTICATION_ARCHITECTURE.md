# Multi-Role Authentication System Architecture

## Overview
This document outlines the recommended architecture for implementing a 3-tier role-based authentication system:
1. **Super Admin** - Single user, unique credentials, full system access
2. **Organization Admin** - Multiple admins, each with unique credentials for their organization
3. **Students** - Multiple students, can belong to organizations

## Recommended Approach: Role-Based Access Control (RBAC) with Multi-Tenancy

### Database Schema Design

#### 1. Users Table
```sql
users
├── id (UUID/Primary Key)
├── email (Unique, Indexed)
├── passwordHash (Bcrypt hashed)
├── role (ENUM: 'super_admin', 'org_admin', 'student')
├── organizationId (Foreign Key, NULL for super_admin)
├── isActive (Boolean, default: true)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

#### 2. Organizations Table
```sql
organizations
├── id (UUID/Primary Key)
├── name (String)
├── code (Unique String, e.g., "ORG001")
├── adminId (Foreign Key → users.id, UNIQUE)
├── isActive (Boolean)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

#### 3. Students Table (Extended User Info)
```sql
students
├── id (UUID/Primary Key)
├── userId (Foreign Key → users.id, UNIQUE)
├── organizationId (Foreign Key → organizations.id)
├── firstName (String)
├── lastName (String)
├── loginNumber (String, Unique per organization)
├── dateOfBirth (Date)
└── ... other student-specific fields
```

### Key Design Decisions

#### 1. **Single Users Table with Role Field**
- **Pros**: Simple, unified authentication, easy to query
- **Cons**: Need role-based middleware for authorization
- **Best For**: Your use case (clear role separation)

#### 2. **Organization Isolation**
- Each organization admin can only access their organization's data
- Students belong to one organization
- Super admin can access all organizations

#### 3. **Authentication Flow**

```
Login Request
    ↓
Check User Credentials
    ↓
Verify Role & Organization Access
    ↓
Generate JWT Token (with role + orgId)
    ↓
Return Token + User Info
```

### Implementation Stack Recommendation

#### Backend (Node.js/Express)
- **Database**: MongoDB (Mongoose) OR PostgreSQL (Sequelize/Prisma)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi or express-validator
- **Middleware**: Custom role-based middleware

#### Frontend (React)
- **State Management**: Redux Toolkit (already using)
- **Auth State**: authSlice with user info, role, token
- **Protected Routes**: Route guards based on role
- **Token Storage**: localStorage or httpOnly cookies (more secure)

### Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds (10-12)
   - Never store plain passwords
   - Implement password strength requirements

2. **JWT Token**
   - Include: userId, role, organizationId (if applicable)
   - Set expiration (15min-1hr for access, 7-30 days for refresh)
   - Use refresh tokens for better security

3. **Super Admin Protection**
   - Hard-code super admin creation (seed script)
   - Prevent super admin deletion
   - Separate login endpoint or role check

4. **Organization Isolation**
   - Middleware to verify organizationId matches user's org
   - Prevent cross-organization data access
   - Validate organizationId in all queries

### API Endpoints Structure

```
POST   /api/auth/login              - Universal login (role-based)
POST   /api/auth/logout             - Logout
POST   /api/auth/refresh            - Refresh token
GET    /api/auth/me                 - Get current user

POST   /api/auth/super-admin/login  - Super admin login (optional separate)
POST   /api/auth/org-admin/login    - Org admin login (optional separate)
POST   /api/auth/student/login      - Student login (optional separate)

GET    /api/organizations           - List orgs (super admin only)
POST   /api/organizations           - Create org (super admin only)
GET    /api/organizations/:id       - Get org (super admin or org admin)
PUT    /api/organizations/:id       - Update org (super admin or org admin)

GET    /api/students                - List students (filtered by org)
POST   /api/students                - Create student (org admin)
GET    /api/students/:id            - Get student (filtered by org)
```

### Middleware Structure

```javascript
// authMiddleware.js
- verifyToken()           - Verify JWT token
- requireAuth()           - User must be authenticated
- requireRole(['super_admin', 'org_admin']) - Role check
- requireSuperAdmin()     - Super admin only
- requireOrgAdmin()       - Org admin only
- requireStudent()        - Student only
- checkOrgAccess()        - Verify user can access organization
```

### Frontend Route Protection

```javascript
// ProtectedRoute.jsx
- PublicRoute          - Accessible to all
- StudentRoute         - Students only
- AdminRoute           - Org admins + Super admin
- SuperAdminRoute      - Super admin only
```

## Implementation Steps

1. **Database Setup**
   - Choose database (MongoDB recommended for flexibility)
   - Create models/schemas
   - Create seed script for super admin

2. **Backend Authentication**
   - Install dependencies (jsonwebtoken, bcryptjs, etc.)
   - Create auth routes
   - Create middleware
   - Create user/organization models

3. **Frontend Authentication**
   - Create authSlice (Redux)
   - Create login components
   - Create protected routes
   - Add auth state management

4. **Testing**
   - Test each role's access
   - Test organization isolation
   - Test super admin privileges

## Alternative Approaches Considered

### Option 1: Separate Tables for Each Role
- **Pros**: Clear separation, type safety
- **Cons**: Complex joins, duplicate auth logic
- **Verdict**: Overkill for this use case

### Option 2: Single Table with Role Field (RECOMMENDED)
- **Pros**: Simple, unified auth, easy to extend
- **Cons**: Need careful middleware
- **Verdict**: ✅ Best for your needs

### Option 3: OAuth/Third-party Auth
- **Pros**: Less code, managed security
- **Cons**: Less control, potential costs
- **Verdict**: Overkill for internal system

## Next Steps

1. Choose database (MongoDB or PostgreSQL)
2. Set up database models
3. Implement authentication backend
4. Implement authentication frontend
5. Add role-based route protection
6. Test thoroughly
