import React from 'react';

interface NewsletterTemplateProps {
  title: string;
  content: string;
  unsubscribeUrl: string;
  previewText?: string;
}

export default function NewsletterTemplate({
  title,
  content,
  unsubscribeUrl,
  previewText = '뉴스레터를 확인하세요'
}: NewsletterTemplateProps) {
  // 인라인 스타일
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      backgroundColor: '#ffffff',
    },
    header: {
      backgroundColor: '#f8f9fa',
      padding: '32px 24px',
      textAlign: 'center' as const,
      borderBottom: '1px solid #e5e7eb',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      textDecoration: 'none',
    },
    content: {
      padding: '32px 24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '24px',
      lineHeight: '1.3',
    },
    body: {
      fontSize: '16px',
      lineHeight: '1.7',
      color: '#374151',
    },
    footer: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      textAlign: 'center' as const,
      borderTop: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#6b7280',
    },
    unsubscribeLink: {
      color: '#6b7280',
      textDecoration: 'underline',
    },
    previewText: {
      display: 'none',
      fontSize: '1px',
      color: '#ffffff',
      lineHeight: '1px',
      maxHeight: '0px',
      maxWidth: '0px',
      opacity: 0,
      overflow: 'hidden',
    }
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f6' }}>
        {/* 미리보기 텍스트 */}
        <div style={styles.previewText}>
          {previewText}
        </div>
        
        <div style={styles.container}>
          {/* 헤더 */}
          <div style={styles.header}>
            <a href="#" style={styles.logo}>
              📧 뉴스레터
            </a>
          </div>
          
          {/* 본문 */}
          <div style={styles.content}>
            <h1 style={styles.title}>{title}</h1>
            <div 
              style={styles.body}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          
          {/* 푸터 */}
          <div style={styles.footer}>
            <p style={{ margin: '0 0 16px 0' }}>
              이 이메일을 더 이상 받고 싶지 않으시면{' '}
              <a href={unsubscribeUrl} style={styles.unsubscribeLink}>
                구독을 취소
              </a>
              하실 수 있습니다.
            </p>
            <p style={{ margin: 0 }}>
              © 2024 뉴스레터 서비스. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
} 