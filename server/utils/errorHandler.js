const createErrorResponse = (code, message, details = null, statusCode = 400) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  };
};

const createSuccessResponse = (data, message = "Operation successful") => {
  return {
    success: true,
    data,
    message
  };
};

const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TEST_ALREADY_ATTEMPTED: 'TEST_ALREADY_ATTEMPTED',
  TEST_ENDED: 'TEST_ENDED',
  INVALID_TEST: 'INVALID_TEST',
  INVALID_TEST_TIME: 'INVALID_TEST_TIME'
};

module.exports = { createErrorResponse, createSuccessResponse, errorCodes };