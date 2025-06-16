const handleSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    data,
    success: true,
  });
};

const handleError = (
  res,
  statusCode,
  errorCode,
  message,
  additionalDetails = null
) => {
  const errorResponse = {
    error: {
      code: errorCode,
      message: message,
    },
    success: false,
  };

  if (additionalDetails) {
    errorResponse.error = { ...errorResponse.error, ...additionalDetails };
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  handleSuccess,
  handleError,
};
