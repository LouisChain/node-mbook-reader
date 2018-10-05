const unauthorized_access = {
  status: 401,
  errorCode: 1000,
  message: "Unauthorized access"
}
const missing_token = {
  status: 403,
  errorCode: 1001,
  message: "No token provided"
}
const unknown_error = {
  status: 500,
  errorCode: 1002,
  message: "Unknown Server error"
}
const fb_token_expired = {
  status: 401,
  errorCode: 1003,
  message: "Facebook access token has expired"
}
const fb_token_invalid = {
  status: 401,
  errorCode: 1004,
  message: "Invalid facebook access token"
}
const refresh_token_notfound = {
  status: 404,
  errorCode: 1005,
  message: "Refresh token not found"
}
const item_query_error = {
  status: 500,
  errorCode: 1006,
  message: "Items query error"
}

module.exports = {
  unauthorized_access, missing_token, unknown_error,
  fb_token_expired, fb_token_invalid, refresh_token_notfound,
  item_query_error
}