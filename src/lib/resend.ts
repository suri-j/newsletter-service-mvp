import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// 기본 발신자 정보
export const defaultFrom = process.env.RESEND_FROM_EMAIL || 'newsletter@example.com';
export const defaultFromName = process.env.RESEND_FROM_NAME || '뉴스레터';

// 이메일 설정
export const emailConfig = {
  from: `${defaultFromName} <${defaultFrom}>`,
  replyTo: process.env.RESEND_REPLY_TO || defaultFrom,
}; 