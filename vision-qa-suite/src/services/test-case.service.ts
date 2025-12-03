// services/test-case.service.ts
import { TestCase } from '@/types/test-case';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Mock data - temporary until backend is ready
const mockTestCases: TestCase[] = [
  // Feature 1: User Authentication
  {
    id: 1,
    featureId: 1,
    title: "Verify login with valid credentials",
    priority: "high",
    status: "passed",
    preconditions: "User account exists in the system",
    steps: [
      "Navigate to login page",
      "Enter valid email address",
      "Enter valid password",
      "Click login button"
    ],
    expectedResult: "User successfully logged in and redirected to dashboard",
    actualResult: "User successfully logged in and redirected to dashboard",
    bugReports: [],
  },
  {
    id: 2,
    featureId: 1,
    title: "Verify login with invalid password",
    priority: "high",
    status: "failed",
    preconditions: "User account exists in the system",
    steps: [
      "Navigate to login page",
      "Enter valid email address",
      "Enter invalid password",
      "Click login button"
    ],
    expectedResult: "Error message displayed: 'Invalid email or password'",
    actualResult: "No error message displayed",
    bugReports: [1],
  },
  {
    id: 3,
    featureId: 1,
    title: "Verify empty field validation",
    priority: "medium",
    status: "pending",
    preconditions: "None",
    steps: [
      "Navigate to login page",
      "Leave email field empty",
      "Leave password field empty",
      "Click login button"
    ],
    expectedResult: "Validation errors displayed for both fields",
    actualResult: "",
    bugReports: [],
  },
  {
    id: 4,
    featureId: 1,
    title: "Verify password reset functionality",
    priority: "high",
    status: "passed",
    preconditions: "User account exists with verified email",
    steps: [
      "Navigate to login page",
      "Click 'Forgot Password' link",
      "Enter registered email address",
      "Click 'Send Reset Link' button",
      "Check email inbox"
    ],
    expectedResult: "Password reset email is sent to user's email address",
    actualResult: "Password reset email sent successfully",
    bugReports: [],
  },
  {
    id: 5,
    featureId: 1,
    title: "Verify session timeout after inactivity",
    priority: "medium",
    status: "passed",
    preconditions: "User is logged in",
    steps: [
      "Login to the system",
      "Wait for 30 minutes without any activity",
      "Try to access a protected page"
    ],
    expectedResult: "User is logged out and redirected to login page",
    actualResult: "Session expired, redirected to login page",
    bugReports: [],
  },
  {
    id: 6,
    featureId: 1,
    title: "Verify login with non-existent email",
    priority: "medium",
    status: "passed",
    preconditions: "No user account exists with the test email",
    steps: [
      "Navigate to login page",
      "Enter non-existent email address",
      "Enter any password",
      "Click login button"
    ],
    expectedResult: "Error message displayed: 'Invalid email or password'",
    actualResult: "Error message displayed correctly",
    bugReports: [],
  },
  {
    id: 7,
    featureId: 1,
    title: "Verify remember me functionality",
    priority: "low",
    status: "pending",
    preconditions: "User account exists",
    steps: [
      "Navigate to login page",
      "Enter valid credentials",
      "Check 'Remember Me' checkbox",
      "Click login button",
      "Close browser and reopen",
      "Navigate to application URL"
    ],
    expectedResult: "User remains logged in without entering credentials again",
    actualResult: "",
    bugReports: [],
  },
  {
    id: 8,
    featureId: 1,
    title: "Verify logout functionality",
    priority: "high",
    status: "passed",
    preconditions: "User is logged in",
    steps: [
      "Click on user profile menu",
      "Click 'Logout' button",
      "Try to access a protected page"
    ],
    expectedResult: "User is logged out and redirected to login page, cannot access protected pages",
    actualResult: "Logout successful, redirected to login page",
    bugReports: [],
  },
  // Feature 2: Product Management
  {
    id: 9,
    featureId: 2,
    title: "Verify adding a new product",
    priority: "high",
    status: "passed",
    preconditions: "Admin user is logged in",
    steps: [
      "Navigate to Products page",
      "Click 'Add New Product' button",
      "Fill in product name, description, price",
      "Upload product image",
      "Click 'Save' button"
    ],
    expectedResult: "New product is added and appears in the product list",
    actualResult: "Product added successfully",
    bugReports: [],
  },
  {
    id: 10,
    featureId: 2,
    title: "Verify editing an existing product",
    priority: "high",
    status: "passed",
    preconditions: "Product exists in the system",
    steps: [
      "Navigate to Products page",
      "Click on a product to edit",
      "Modify product details",
      "Click 'Save Changes' button"
    ],
    expectedResult: "Product details are updated and changes are reflected in the product list",
    actualResult: "Product updated successfully",
    bugReports: [],
  },
  {
    id: 11,
    featureId: 2,
    title: "Verify deleting a product",
    priority: "medium",
    status: "pending",
    preconditions: "Product exists in the system",
    steps: [
      "Navigate to Products page",
      "Click on a product",
      "Click 'Delete' button",
      "Confirm deletion in the dialog"
    ],
    expectedResult: "Product is deleted and removed from the product list",
    actualResult: "",
    bugReports: [],
  },
  {
    id: 12,
    featureId: 2,
    title: "Verify product image upload validation",
    priority: "medium",
    status: "passed",
    preconditions: "Admin user is logged in",
    steps: [
      "Navigate to Add Product page",
      "Try to upload an image file larger than 5MB",
      "Click 'Save' button"
    ],
    expectedResult: "Error message displayed: 'Image size must be less than 5MB'",
    actualResult: "Validation error displayed correctly",
    bugReports: [],
  },
  // Feature 3: Checkout Process
  {
    id: 13,
    featureId: 3,
    title: "Verify checkout with valid payment",
    priority: "high",
    status: "passed",
    preconditions: "User has items in cart and is logged in",
    steps: [
      "Navigate to shopping cart",
      "Click 'Proceed to Checkout'",
      "Enter shipping address",
      "Select payment method",
      "Enter valid payment details",
      "Click 'Place Order' button"
    ],
    expectedResult: "Order is placed successfully and confirmation email is sent",
    actualResult: "Order placed successfully",
    bugReports: [],
  },
  {
    id: 14,
    featureId: 3,
    title: "Verify checkout with invalid credit card",
    priority: "high",
    status: "passed",
    preconditions: "User has items in cart",
    steps: [
      "Navigate to checkout page",
      "Enter invalid credit card number",
      "Click 'Place Order' button"
    ],
    expectedResult: "Error message displayed: 'Invalid credit card number'",
    actualResult: "Validation error displayed correctly",
    bugReports: [],
  },
  {
    id: 15,
    featureId: 3,
    title: "Verify order confirmation email",
    priority: "medium",
    status: "passed",
    preconditions: "Order is placed successfully",
    steps: [
      "Complete a purchase",
      "Check user's email inbox"
    ],
    expectedResult: "Order confirmation email is received with order details",
    actualResult: "Email received successfully",
    bugReports: [],
  },
  // Feature 4: Shopping Cart
  {
    id: 16,
    featureId: 4,
    title: "Verify adding item to cart",
    priority: "high",
    status: "passed",
    preconditions: "User is logged in, product exists",
    steps: [
      "Navigate to product page",
      "Click 'Add to Cart' button",
      "Navigate to shopping cart"
    ],
    expectedResult: "Item is added to cart and displayed in cart page",
    actualResult: "Item added successfully",
    bugReports: [],
  },
  {
    id: 17,
    featureId: 4,
    title: "Verify removing item from cart",
    priority: "high",
    status: "passed",
    preconditions: "Cart has items",
    steps: [
      "Navigate to shopping cart",
      "Click 'Remove' button for an item",
      "Confirm removal"
    ],
    expectedResult: "Item is removed from cart and cart total is updated",
    actualResult: "Item removed successfully",
    bugReports: [],
  },
  {
    id: 18,
    featureId: 4,
    title: "Verify updating item quantity",
    priority: "medium",
    status: "passed",
    preconditions: "Cart has items",
    steps: [
      "Navigate to shopping cart",
      "Change quantity of an item",
      "Verify cart total updates"
    ],
    expectedResult: "Item quantity is updated and cart total reflects the change",
    actualResult: "Quantity updated successfully",
    bugReports: [],
  },
  // Feature 5: User Profile Management
  {
    id: 19,
    featureId: 5,
    title: "Verify viewing user profile",
    priority: "medium",
    status: "passed",
    preconditions: "User is logged in",
    steps: [
      "Click on user profile icon",
      "Select 'My Profile' from dropdown"
    ],
    expectedResult: "User profile page displays with all user information",
    actualResult: "Profile displayed correctly",
    bugReports: [],
  },
  {
    id: 20,
    featureId: 5,
    title: "Verify editing profile information",
    priority: "medium",
    status: "pending",
    preconditions: "User is logged in",
    steps: [
      "Navigate to profile page",
      "Click 'Edit Profile' button",
      "Modify name and email",
      "Click 'Save Changes' button"
    ],
    expectedResult: "Profile information is updated and changes are saved",
    actualResult: "",
    bugReports: [],
  },
  // Feature 6: Order History
  {
    id: 21,
    featureId: 6,
    title: "Verify viewing order history",
    priority: "low",
    status: "passed",
    preconditions: "User has placed orders",
    steps: [
      "Navigate to 'My Orders' page",
      "View order list"
    ],
    expectedResult: "All previous orders are displayed with order details",
    actualResult: "Order history displayed correctly",
    bugReports: [],
  },
  {
    id: 22,
    featureId: 6,
    title: "Verify order details view",
    priority: "low",
    status: "passed",
    preconditions: "User has orders",
    steps: [
      "Navigate to order history",
      "Click on an order"
    ],
    expectedResult: "Order details page displays with items, prices, and status",
    actualResult: "Order details displayed correctly",
    bugReports: [],
  },
];

export const testCaseService = {
  async fetchTestCases(featureId: number): Promise<TestCase[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockTestCases.filter(tc => tc.featureId === featureId).length > 0
      ? mockTestCases.filter(tc => tc.featureId === featureId)
      : mockTestCases.map(tc => ({ ...tc, featureId }));
  },

  async createTestCase(testCaseData: Omit<TestCase, 'id'>): Promise<TestCase> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newId = mockTestCases.length > 0
      ? Math.max(...mockTestCases.map(tc => tc.id)) + 1
      : 1;

    const testCaseToAdd: TestCase = {
      ...testCaseData,
      id: newId,
      featureId: testCaseData.featureId, // مهم للتوافق
    };

    mockTestCases.push(testCaseToAdd);
    return testCaseToAdd;
  },

  async updateTestCase(testCaseId: number, testCaseData: Partial<TestCase>): Promise<TestCase> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index === -1) {
        throw new Error('Test case not found');
      }
      mockTestCases[index] = { ...mockTestCases[index], ...testCaseData };
      return mockTestCases[index];
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(testCaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update test case');
      }

      const data = await response.json();
      
      // Update mock data as fallback
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases[index] = { ...mockTestCases[index], ...data.data };
        return mockTestCases[index];
      }
      
      return data.data;
    } catch (error: any) {
      console.error('Error updating test case:', error);
      // Fallback to mock update
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases[index] = { ...mockTestCases[index], ...testCaseData };
        return mockTestCases[index];
      }
      throw error;
    }
  },

  async deleteTestCase(testCaseId: number): Promise<void> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases.splice(index, 1);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete test case');
      }

      // Remove from mock data as fallback
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases.splice(index, 1);
      }
    } catch (error: any) {
      console.error('Error deleting test case:', error);
      // Fallback: remove from mock data anyway
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases.splice(index, 1);
      }
      throw error;
    }
  },

  async updateTestCaseStatus(testCaseId: number, status: "passed" | "failed"): Promise<TestCase> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      mockTestCases[index] = {
        ...mockTestCases[index],
        status,
        actualResult: status === "passed"
          ? mockTestCases[index].expectedResult
          : mockTestCases[index].actualResult || "Test failed - unexpected behavior",
      };
      return mockTestCases[index];
    }
    throw new Error('Test case not found');
  },

  // Generate test cases from feature using AI
  async generateAITestCases(featureId: string, options?: any): Promise<TestCase[]> {
    if (USE_MOCK_API) {
      // In mock mode, just clone some existing test cases and attach them to this feature
      await new Promise(resolve => setTimeout(resolve, 1200));
      const base = mockTestCases.slice(0, 3);
      const generated: TestCase[] = base.map((tc, idx) => ({
        ...tc,
        id: mockTestCases.length + idx + 1,
        featureId: parseInt(featureId, 10),
        title: `${tc.title} (AI Generated)`,
        status: 'pending',
      }));
      mockTestCases.push(...generated);
      return generated;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/generate-test-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ options: options || {} }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Transform backend test cases to frontend format
        return result.data.map((tc: any) => ({
          id: parseInt(tc._id || tc.id) || 0,
          title: tc.title || '',
          priority: (tc.priority?.toLowerCase() || 'medium') as "high" | "medium" | "low",
          status: (tc.status?.toLowerCase() || 'pending') as "passed" | "failed" | "pending",
          preconditions: tc.preconditions || '',
          steps: Array.isArray(tc.steps) ? tc.steps : [],
          expectedResult: tc.expectedResult || '',
          actualResult: tc.actualResult || '',
          bugReports: Array.isArray(tc.bugReports) ? tc.bugReports : [],
          featureId: typeof tc.featureId === 'object' 
            ? parseInt(tc.featureId._id || tc.featureId) || parseInt(featureId)
            : parseInt(tc.featureId || featureId),
          projectId: typeof tc.projectId === 'object'
            ? parseInt(tc.projectId._id || tc.projectId)
            : tc.projectId ? parseInt(tc.projectId) : undefined,
          createdAt: tc.createdAt,
          updatedAt: tc.updatedAt,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  },
};
