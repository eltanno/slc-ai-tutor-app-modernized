// Test user credentials - loaded from environment variables
// Set these in root .env file:
//   TEST_USER_EMAIL, TEST_USER_PASSWORD
//   TEST_STAFF_EMAIL, TEST_STAFF_PASSWORD

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'user@test.com',
  password: process.env.TEST_USER_PASSWORD || '',
};

export const TEST_STAFF_USER = {
  email: process.env.TEST_STAFF_EMAIL || 'admin@test.com',
  password: process.env.TEST_STAFF_PASSWORD || '',
};

// API endpoints
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// App URLs
export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5174';
