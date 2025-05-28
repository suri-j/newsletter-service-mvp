import { renderToStaticMarkup } from 'react-dom/server';
import NewsletterTemplate from '@/components/email/NewsletterTemplate';
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
  
  const emailHtml = renderToStaticMarkup(
    NewsletterTemplate({
      title: newsletter.title,
      content: newsletter.content,
      unsubscribeUrl,
      previewText: getPreviewText(newsletter.content)
    })
  );

  return `<!DOCTYPE html>${emailHtml}`;
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