# Google Calendar API Integration Setup Guide

This guide will help you set up Google Calendar API integration for automatic meeting scheduling in SmartRecruitAI.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console
3. A Google Calendar account

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "SmartRecruitAI Calendar"
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API" and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "SmartRecruitAI"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "SmartRecruitAI Calendar Client"
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Download the JSON file with your credentials

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_ACCESS_TOKEN=
GOOGLE_REFRESH_TOKEN=
```

## Step 5: Obtain Access and Refresh Tokens

1. Start your SmartRecruitAI application
2. Navigate to the Settings or Admin panel
3. Look for "Google Calendar Integration" section
4. Click "Connect Google Calendar"
5. Complete the OAuth flow in the popup window
6. The application will display your tokens (store them securely in your .env file)

## Step 6: Test the Integration

1. Go to the Interviews page
2. Click "Schedule Interview"
3. Select a candidate and date/time
4. Click "Schedule & Send Email"
5. Check your Google Calendar - a new event should be created
6. The candidate should receive an email with the Google Meet link

## Features

### Automatic Calendar Events
- Creates calendar events when interviews are scheduled
- Includes candidate information and interview details
- Sets appropriate duration (default: 60 minutes)

### Google Meet Integration
- Automatically generates Google Meet links
- Includes meet link in calendar event
- Sends meet link to candidates via email

### Email Notifications
- Sends calendar invitations to candidates
- Includes all meeting details
- Automatic reminders based on calendar settings

### Calendar Management
- Events are linked to interview records
- Can update or cancel events through the API
- Maintains sync between SmartRecruitAI and Google Calendar

## Troubleshooting

### Common Issues

1. **"Access token expired" error**
   - The access token needs to be refreshed
   - Ensure your refresh token is properly configured
   - Re-authenticate if necessary

2. **"Calendar API not enabled" error**
   - Make sure Google Calendar API is enabled in your GCP project
   - Check that you're using the correct project

3. **"Invalid redirect URI" error**
   - Ensure the redirect URI in your OAuth client matches exactly
   - For production, update to your production domain

4. **"Insufficient permissions" error**
   - Make sure you've granted the required calendar scopes
   - Re-authenticate with proper permissions

### Fallback Behavior

If the Google Calendar API is not configured or fails:
- The system will generate mock Google Meet links
- Interviews can still be scheduled and managed
- Email notifications will still be sent
- Calendar integration can be set up later without affecting existing functionality

## Security Considerations

1. **Store credentials securely**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Consider using a secrets management service in production

2. **Token management**
   - Refresh tokens should be stored securely
   - Implement proper token rotation
   - Monitor for unauthorized access

3. **Scope limitations**
   - Only request necessary calendar permissions
   - Regularly audit API access
   - Implement proper error handling

## Production Deployment

For production deployment:

1. Update OAuth redirect URIs to your production domain
2. Configure proper SSL certificates
3. Use a secure secrets management system
4. Set up monitoring for API quota and errors
5. Implement proper logging for debugging

## API Endpoints

The integration adds these new endpoints:

- `GET /api/auth/google` - Get OAuth authorization URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- Modified `POST /api/interviews/schedule` - Now creates calendar events

## Support

If you encounter issues:

1. Check the application logs for detailed error messages
2. Verify your Google Cloud Console configuration
3. Test with a simple calendar API call
4. Ensure all environment variables are properly set

For additional help, refer to the [Google Calendar API documentation](https://developers.google.com/calendar/api/guides/overview).