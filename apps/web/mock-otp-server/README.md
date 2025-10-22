# Mock OTP Server (Local, Optional)

This is an optional mock OTP server you can run locally without changing the main app codebase.

Endpoints (POST):
- /auth/forgot-password { email }
- /auth/verify-otp { email, otp }
- /auth/reset-password { email, otp, password }

Usage:
- Set `NEXT_PUBLIC_OTP_API_URL=http://localhost:5055` in the web app env to direct OTP calls here.
- Start server: `npm start` from this folder.
