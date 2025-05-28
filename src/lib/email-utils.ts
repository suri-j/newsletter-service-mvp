import { Database } from './database.types';

type Newsletter = Database['public']['Tables']['newsletters']['Row'];
type Subscriber = Database['public']['Tables']['subscribers']['Row'];

/**
 * 뉴스레터 콘텐츠를 HTML 이메일로 변환
 */
export function renderNewsletterEmail(
  newsletter: Newsletter,
  subscriber: Subscriber,
  baseUrl: string = 'http://localhost:3000'
): string {
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${generateUnsubscribeToken(subscriber.id)}`;
  const previewText = getPreviewText(newsletter.content);
  
  // 간단한 HTML 템플릿 사용
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${newsletter.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin: 0; color: #1a1a1a; }
        .content { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d; text-align: center; }
        .unsubscribe { color: #6c757d; text-decoration: none; }
        .unsubscribe:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${newsletter.title}</h1>
      </div>
      
      <div class="content">
        ${newsletter.content}
      </div>
      
      <div class="footer">
        <p>이 이메일이 더 이상 필요하지 않으시면 <a href="${unsubscribeUrl}" class="unsubscribe">구독을 취소</a>하실 수 있습니다.</p>
        <p>© 2024 Newsletter Service. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  return emailHtml;
}

/**
 * 구독 취소 토큰 생성 (간단한 예시 - 실제로는 JWT나 암호화된 토큰 사용)
 */
export function generateUnsubscribeToken(subscriberId: string): string {
  // 실제 구현에서는 JWT나 더 안전한 토큰 생성 방식 사용
  return Buffer.from(subscriberId).toString('base64');
}

/**
 * 구독 취소 토큰에서 구독자 ID 추출
 */
export function parseUnsubscribeToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

/**
 * HTML 콘텐츠에서 미리보기 텍스트 추출
 */
export function getPreviewText(htmlContent: string, maxLength: number = 150): string {
  // HTML 태그 제거
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  
  // 공백 정리 및 길이 제한
  const cleanText = textContent.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength).trim() + '...';
}

/**
 * 이메일 주소 유효성 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 이메일 전송 결과 타입
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 배치 이메일 전송 결과 타입
 */
export interface BatchEmailResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    subscriberId: string;
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
} 