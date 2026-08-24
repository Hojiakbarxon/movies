import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    async sendMail(recipientEmail: string, message: string): Promise<void> {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Movies <noreply@reelhouse.space>',
                    to: recipientEmail,
                    subject: 'Your verification code',
                    html: buildOtpEmailHtml(message),
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Resend API error:', data);
                throw new Error(`Failed to send email: ${data.message || 'unknown error'}`);
            }
            
        } catch (error) {
            console.error('sendMail failed:', error);
            throw error;
        }
    }
    
    async sendRenewalSummary(to: string, userName: string): Promise<void> {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Movies <renewal@reelhouse.space>',
                    to,
                    subject: "Subscription Renewal alerts",
                    html: buildRenewalEmailHtml(userName),
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Resend API error:', data);
                throw new Error(`Failed to send email: ${data.message || 'unknown error'}`);
            }
            
        } catch (error) {
            console.error('sendMail failed:', error);
        }
    }
}

function buildOtpEmailHtml(otp: string): string {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
    <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">Verify your email</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
      Use the code below to confirm your email on <strong>housereel.netlify.app</strong>. This code expires in 5 minutes.
    </p>
    <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
    </div>
    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
      If you didn't request this code, you can safely ignore this email — someone may have entered your email address by mistake. No account will be created or changed without this code.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 11px;">
      This is an automated message from Movies. Please don't reply to this email.
    </p>
  </div>
  `;
};

function buildRenewalEmailHtml(username: string): string {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 32px;">✅</span>
    </div>
    <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px; text-align: center;">Subscription renewed</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;">
      Hi <strong>${username}</strong>, your subscription on <strong>mtdeployedapp.com</strong> has been automatically renewed. You can keep enjoying uninterrupted access to all your favorite movies.
    </p>
    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
      If you'd like to manage or cancel auto-renewal, you can do so anytime from your account settings.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 11px;">
      This is an automated message from Movies. Please don't reply to this email.
    </p>
  </div>
  `;
}