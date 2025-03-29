# Referral-Based Campaign System

## Overview
The Referral-Based Campaign System is a web application designed to manage campaigns, track referrals, and integrate with various CRM systems using Zapier. The application features user authentication, a dashboard for campaign management, and seamless integration with external services.

## Technologies Used
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT for user authentication
- **Deployment**: Vercel for frontend and backend hosting

## Features
- User authentication (Google OAuth)
- Campaign management dashboard
- Integration with Zapier for CRM functionalities
- Error handling and logging

## Installation

### Prerequisites
- Node.js (version 14.x or higher)
- MongoDB (local or cloud instance)
- Vercel CLI (for deployment)

### Clone the Repository
```bash
git clone https://github.com/AdityarajsinhChauhan/referrel-based-campaign.git
cd referral-based-campaign-system
```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```

## Usage
- Access the frontend application at `http://localhost:3000` (or the port specified by Vite).
- Use the dashboard to create and manage campaigns.
- Connect your CRM using the Zapier integration feature.

## Deployment
- The application is deployed on Vercel. The frontend and backend are configured to work seamlessly together.
- Ensure to set up environment variables in Vercel for sensitive information such as database connection strings and API keys.
