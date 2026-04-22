export const testCase = {
  title: "User can login",
  description: "Validate login with valid credentials",
  preconditions: ["User exists", "User is on login page"],
  steps: ["Enter email", "Enter password", "Click login"],
  expectedResult: "User is redirected to dashboard",
  featureId: "feature123",
};


