# Role-Based Access Control System

## Overview
This Vehicle Service Center Management System now includes a comprehensive role-based access control system with two distinct user roles:

## User Roles

### 1. Admin Role
- **Username**: `admin`
- **Password**: `admin123`
- **Permissions**: Full access to all system features
  - View all data (customers, vehicles, employees, services, inventory, billing, branches)
  - Add new records to any table
  - Update existing records
  - Delete records
  - Access to all management forms

### 2. Visitor Role
- **Username**: `visitor`
- **Password**: `visitor123`
- **Permissions**: View-only access
  - View all data tables
  - No access to add, update, or delete operations
  - Forms are hidden and replaced with informational messages

## Technical Implementation

### Backend (API-level Protection)
- **Authentication Middleware**: `requireRole(['admin', 'visitor'])` for different endpoints
- **Create Operations**: Restricted to admin only (`POST /api/add-*`)
- **Read Operations**: Available to both admin and visitor (`GET /api/*`)
- **Update Operations**: Restricted to admin only (`PUT /api/update-*`)
- **Delete Operations**: Restricted to admin only (`DELETE /api/delete/*`)

### Frontend (UI-level Protection)
- **Role Detection**: Automatically detects user role on page load via `/api/user` endpoint
- **Dynamic UI**: Shows/hides elements based on user role using CSS classes:
  - `.admin-only` - Only visible to admin users
  - `.visitor-only` - Only visible to visitor users
- **User Information**: Displays current user and role in navbar with logout option
- **Action Buttons**: Edit/Delete buttons in data tables only visible to admin users
- **Form Access**: Add/Update forms hidden for visitors, replaced with informational messages

### Security Features
- **Session-based Authentication**: All API requests require valid session ID
- **Role Verification**: Every protected endpoint verifies user role before execution
- **Access Denied Messages**: Clear error messages for unauthorized access attempts
- **Automatic Logout**: Invalid sessions redirect to login page

## Login Instructions

### For Admin Access:
1. Go to the login page
2. Enter Username: `admin`
3. Enter Password: `admin123`
4. You'll have full access to all features

### For Visitor Access:
1. Go to the login page
2. Enter Username: `visitor`
3. Enter Password: `visitor123`
4. You'll be able to view data but cannot modify anything

## API Endpoints and Permissions

| Endpoint | Admin | Visitor | Description |
|----------|-------|---------|-------------|
| `POST /api/login` | ✓ | ✓ | User authentication |
| `POST /api/logout` | ✓ | ✓ | User logout |
| `GET /api/user` | ✓ | ✓ | Get current user info |
| `GET /api/{entity}` | ✓ | ✓ | View data (all entities) |
| `POST /api/add-{entity}` | ✓ | ✗ | Add new records |
| `PUT /api/update-{entity}` | ✓ | ✗ | Update existing records |
| `DELETE /api/delete/{table}/{key}/{id}` | ✓ | ✗ | Delete records |

## UI Features by Role

### Admin Users See:
- All management forms (Customer, Vehicle, Employee, Service, Inventory, Billing, Branch)
- Add/Submit buttons for all forms
- Edit/Delete buttons in data tables
- Full navigation menu

### Visitor Users See:
- View buttons for all data tables
- "Visitor Mode" informational messages explaining restrictions
- Read-only data tables without action buttons
- Same navigation menu but forms are hidden

## Error Handling
- **403 Forbidden**: Returned when visitors try to access admin-only endpoints
- **401 Unauthorized**: Returned when session is invalid or missing
- **User-friendly Messages**: Frontend displays appropriate error messages for access violations

The system ensures data security while providing a clear distinction between administrative and visitor access levels.