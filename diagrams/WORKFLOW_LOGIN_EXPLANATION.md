# Workflow - User Login (Sign In)

## Overview
This workflow authenticates existing users and grants access to the application.

## Components & Responsibilities

### **Frontend (Web App)**
- **Responsibility**: Display login form
- **Input**: User enters email and password
- **Output**: Success/error notifications, redirect

### **Backend API (Auth Controller)**
- **Responsibility**: Handle login request
- **Input**: Email and password
- **Output**: Returns user data + token

### **Validation**
- **Responsibility**: Validate input fields
- **Checks**: Email and password required
- **Output**: Validation result

### **User Lookup**
- **Responsibility**: Find user by email
- **Database**: MongoDB
- **Output**: User document or null

### **Email Verification Check**
- **Responsibility**: Verify user's email is verified
- **Checks**: isVerified flag
- **Output**: Verification status

### **Password Comparison**
- **Responsibility**: Verify password
- **Method**: bcrypt.compare
- **Output**: Password match result

### **JWT Token Generation**
- **Responsibility**: Create authentication token
- **Expires**: 7 days
- **Output**: JWT token

### **MongoDB**
- **Responsibility**: 
  - Store user data
  - Update login stats (lastLogin, loginCount)
- **Output**: User document updated

## Workflow Steps

1. **User enters credentials** → Frontend sends email + password
2. **Validation** → Check fields are filled
3. **Find user** → Search by email in MongoDB
4. **Check verification** → Verify email is verified
5. **Compare password** → Verify password matches
6. **Generate token** → Create JWT token
7. **Update stats** → Update lastLogin and loginCount
8. **Response** → User redirected to Dashboard

## Final Output
- **MongoDB**: User login stats updated
- **Frontend**: User authenticated, redirected to Dashboard
- **Token**: JWT token for session authentication

