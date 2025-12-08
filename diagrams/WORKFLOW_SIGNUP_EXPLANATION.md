# Workflow - User Signup (Create Account)

## Overview
This workflow handles user account creation with email verification.

## Components & Responsibilities

### **Frontend (Web App)**
- **Responsibility**: Display signup form
- **Input**: User enters name, email, password
- **Output**: Success/error notifications

### **Backend API (Auth Controller)**
- **Responsibility**: Handle signup request
- **Input**: Name, email, password
- **Output**: Returns user data + token

### **Validation**
- **Responsibility**: Validate input fields
- **Checks**: All fields required, email format, password length
- **Output**: Validation result

### **User Service**
- **Responsibility**: User management logic
- **Checks**: Email uniqueness
- **Output**: User creation result

### **Password Hashing**
- **Responsibility**: Secure password storage
- **Method**: bcrypt hashing
- **Output**: Hashed password

### **Email Verification**
- **Responsibility**: Generate verification token
- **Output**: Verification token

### **MongoDB**
- **Responsibility**: Store user data
- **Stores**: User document with isVerified: false
- **Output**: User saved

### **Email Service**
- **Responsibility**: Send verification email
- **Output**: Verification email sent

### **JWT Token Generation**
- **Responsibility**: Create authentication token
- **Expires**: 7 days
- **Output**: JWT token

## Workflow Steps

1. **User fills form** → Frontend collects data
2. **Validation** → Check all fields
3. **Check email** → Verify email not exists
4. **Create user** → Hash password, generate token
5. **Save to MongoDB** → Store user (isVerified: false)
6. **Send email** → Verification email sent
7. **Generate JWT** → Create auth token
8. **Response** → User redirected to Dashboard

## Final Output
- **MongoDB**: User document created (unverified)
- **Email**: Verification link sent
- **Frontend**: User logged in, redirected to Dashboard
- **Token**: JWT token for authentication

