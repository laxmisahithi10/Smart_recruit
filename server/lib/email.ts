export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In a real application, this would use nodemailer or similar
  // For now, we'll simulate email sending
  console.log("Simulating email send:");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.body}`);
  
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return true;
}

export function generateInterviewEmail(
  candidateName: string,
  position: string,
  meetingLink: string,
  scheduledDate: Date
): EmailOptions {
  return {
    to: "", // Will be filled in by caller
    subject: `Interview Scheduled - ${position} Position`,
    body: `Dear ${candidateName},

We are pleased to invite you to an interview for the ${position} position.

Interview Details:
Date & Time: ${scheduledDate.toLocaleString()}
Meeting Link: ${meetingLink}

Please join the meeting at the scheduled time. If you need to reschedule, please contact us as soon as possible.

We look forward to speaking with you!

Best regards,
Recruitment Team`,
  };
}
