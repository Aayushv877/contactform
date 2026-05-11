Serverless Contact Form App

A fully serverless contact form application built using AWS cloud services and a modern React frontend. The project allows users to submit messages through a hosted contact form, stores submissions in DynamoDB, and sends automated email notifications using Amazon SES.

Architecture
Frontend (React/Vite)
        ↓
API Gateway
        ↓
AWS Lambda
        ↓
DynamoDB
        ↓
Amazon SES
Features
Modern responsive contact form UI
Serverless backend using AWS Lambda
REST API using API Gateway
Stores messages in DynamoDB
Sends email notifications using Amazon SES
Form validation
Toast notifications
Dark/Light mode
CORS enabled API integration
Tech Stack
Frontend
React
Vite
JavaScript
AWS Services
API Gateway
AWS Lambda
DynamoDB
Amazon SES
IAM
CloudWatch
Project Structure
project/
│
├── frontend/
│   ├── src/
│   │   ├── ContactForm.jsx
│   │   ├── main.jsx
│   │
│   ├── package.json
│
├── backend/
│   ├── lambda-function.js
│
├── README.md
How It Works
User submits contact form
Frontend sends POST request to API Gateway
API Gateway triggers Lambda function
Lambda:
validates request
stores message in DynamoDB
sends email using SES
Success response is returned to frontend
AWS Architecture Details
API Gateway

Handles HTTP POST requests from frontend.

Endpoint Example:

POST /contact
AWS Lambda

Processes incoming form data and integrates with DynamoDB and SES.

Responsibilities:

Parse request body
Validate data
Store data
Send email notification
Return API response
DynamoDB

Stores contact form submissions.

Example Record:

{
  "id": "174700001",
  "name": "Aayush",
  "email": "test@gmail.com",
  "message": "Hello AWS"
}
Amazon SES

Sends automated email notifications whenever a new form is submitted.

Setup Instructions
1. Clone Repository
git clone https://github.com/your-username/serverless-contact-form.git
2. Install Dependencies
npm install
3. Configure API URL

Inside:

ContactForm.jsx

Update:

const API_URL =
  "https://your-api-id.execute-api.region.amazonaws.com/prod/contact";
4. Run Project
npm run dev
5. Deploy Frontend

You can deploy using:

Netlify
Vercel
Lambda Environment
Required IAM Permissions

Attach these policies to Lambda role:

AmazonDynamoDBFullAccess
AmazonSESFullAccess
CloudWatchLogsFullAccess
DynamoDB Table
Table Name
ContactMessage
Partition Key
id
SES Setup
Verify sender email in Amazon SES
Use verified email inside Lambda code
Attach SES permissions to Lambda role
Example API Request
{
  "name": "Aayush",
  "email": "test@gmail.com",
  "message": "Hello from frontend"
}
Example Success Response
{
  "success": true,
  "message": "Message saved and email sent"
}
Skills Demonstrated
Serverless Architecture
REST API Development
AWS Lambda
API Gateway
DynamoDB Integration
Amazon SES
IAM Permissions
React Frontend Integration
CORS Configuration
Cloud-Based Backend Development
Future Improvements
Authentication using Cognito
File uploads using S3
Admin dashboard
CAPTCHA protection
CI/CD pipeline
Infrastructure as Code using Terraform
Custom domain integration
Author

Aayush Vishwakarma

Cloud & DevOps Enthusiast

License

This project is open-source and available under the MIT License.
