import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

class GoogleCalendarService {
  private calendar: any;
  private auth: OAuth2Client;
  private isConfigured: boolean;

  constructor() {
    // Check if Google Calendar is properly configured
    this.isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    if (!this.isConfigured) {
      console.log('Google Calendar API not configured - using fallback mode');
      return;
    }

    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if available
    if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
      this.auth.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createMeetingEvent(
    candidateName: string,
    candidateEmail: string,
    position: string,
    startTime: Date,
    durationMinutes: number = 60
  ): Promise<{ eventId: string; meetLink: string; calendarLink: string }> {
    // If not configured, return fallback data immediately
    if (!this.isConfigured) {
      const meetingId = Math.random().toString(36).substring(7);
      return {
        eventId: `fallback-${meetingId}`,
        meetLink: `https://meet.google.com/${meetingId}`,
        calendarLink: `https://calendar.google.com/calendar/event?eid=${meetingId}`,
      };
    }

    try {
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      
      const event: CalendarEvent = {
        summary: `Interview: ${candidateName} - ${position}`,
        description: `Interview session with ${candidateName} for the ${position} position.\n\nCandidate: ${candidateName}\nPosition: ${position}\nEmail: ${candidateEmail}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: candidateEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      const eventId = response.data.id;
      const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || 
                      response.data.hangoutLink || 
                      `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
      const calendarLink = response.data.htmlLink;

      return {
        eventId,
        meetLink,
        calendarLink,
      };
    } catch (error) {
      console.error('Google Calendar API error:', error);
      
      // Fallback: return mock data if Calendar API fails
      const meetingId = Math.random().toString(36).substring(7);
      return {
        eventId: `mock-${meetingId}`,
        meetLink: `https://meet.google.com/${meetingId}`,
        calendarLink: `https://calendar.google.com/calendar/event?eid=${meetingId}`,
      };
    }
  }

  async updateMeetingEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<boolean> {
    try {
      await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updates,
        sendUpdates: 'all',
      });
      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  }

  async deleteMeetingEvent(eventId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }

  getAuthUrl(): string {
    if (!this.isConfigured) {
      throw new Error('Google Calendar API not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getAccessToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
    if (!this.isConfigured) {
      throw new Error('Google Calendar API not configured');
    }

    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    
    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
    };
  }

  isGoogleCalendarConfigured(): boolean {
    return this.isConfigured;
  }
}

export const googleCalendarService = new GoogleCalendarService();