# Register
POST https://edtech-mentor-payout-system.onrender.com/api/auth/register
Headers:
- Content-Type: application/json
Body:
{
    "name": "Test Mentor",
    "email": "mentor@example.com",
    "password": "password123",
    "role": "mentor",
    "hourlyRate": 50
}

#Login
POST https://edtech-mentor-payout-system.onrender.com/api/auth/login
Headers:
- Content-Type: application/json
Body:
{
    "email": "mentor@example.com",
    "password": "password123"
}

#Create Admin
POST https://edtech-mentor-payout-system.onrender.com/api/auth/create-admin
Headers:
- Authorization: Bearer {token}
- Content-Type: application/json
Body:
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
}