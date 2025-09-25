# API Endpoints

## Auth
 - `GET /auth/isEmailAvailable`
 - `GET /auth/isUsernameAvailable`
 - `POST /auth/register`
 - `POST /auth/login`
 - `POST /auth/registerViaGoogle`
 - `POST /auth/loginViaGoogle`
 - `POST /auth/registerViaFacebook`
 - `POST /auth/loginViaFacebook`
 - `POST /auth/refresh`
 - `POST /auth/reauth`
 - `POST /auth/forgotPassword`
 - `POST /auth/decodeResetPasswordToken`
 - `PATCH /auth/resetPassword`
 - `DELETE /auth/logout`

## User
 - `GET /user/fetchSession`
 - `GET /user/determineReauth`
 - `PATCH /user/updateSetting`
 - `PATCH /user/resetSetting`
 - `PATCH /user/verifyEmail`
 - `PATCH /user/updateEmail`
 - `PATCH /user/changePassword`
 - `DELETE /user/deleteAccount`

## Interaction
 - `GET /interaction/fetchInteractions`