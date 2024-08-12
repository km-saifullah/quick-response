const apiResponse = (statusCode, message, data = null) => {
  return {
    statusCode,
    message,
    data,
    timestamp: new Date().toDateString(),
  };
};

export default apiResponse;

