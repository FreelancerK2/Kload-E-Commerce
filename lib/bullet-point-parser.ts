/**
 * Utility functions for parsing and formatting bullet point text
 */

export interface BulletPoint {
  text: string;
  isBold?: boolean;
}

/**
 * Parse text with bullet points into structured data
 * Supports formats like:
 * - Item 1
 * • Item 2
 * * Item 3
 * - **Bold Item**
 * • *Italic Item*
 */
export function parseBulletPoints(text: string): BulletPoint[] {
  if (!text) return [];

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const bulletPoints: BulletPoint[] = [];

  for (const line of lines) {
    // Check if line starts with bullet point indicators
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      let text = bulletMatch[1];
      let isBold = false;

      // Check for bold formatting (**text**)
      if (text.includes('**')) {
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        isBold = true;
      }

      // Check for italic formatting (*text*)
      if (text.includes('*') && !text.includes('**')) {
        text = text.replace(/\*(.*?)\*/g, '$1');
      }

      bulletPoints.push({
        text: text.trim(),
        isBold
      });
    }
  }

  return bulletPoints;
}

/**
 * Format bullet points as HTML string
 */
export function formatBulletPointsAsHTML(bulletPoints: BulletPoint[]): string {
  if (bulletPoints.length === 0) return '';

  return bulletPoints
    .map(point => {
      const text = point.isBold ? `<strong>${point.text}</strong>` : point.text;
      return `<li class="mb-1">${text}</li>`;
    })
    .join('');
}

/**
 * Convert bullet points back to text format
 */
export function bulletPointsToText(bulletPoints: BulletPoint[]): string {
  if (bulletPoints.length === 0) return '';

  return bulletPoints
    .map(point => {
      const text = point.isBold ? `**${point.text}**` : point.text;
      return `• ${text}`;
    })
    .join('\n');
}

/**
 * Check if text contains bullet points
 */
export function hasBulletPoints(text: string): boolean {
  if (!text) return false;
  return /^[-•*]\s+/m.test(text);
}

/**
 * Convert plain text to bullet point format
 */
export function convertToBulletPoints(text: string): string {
  if (!text) return '';
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  return lines.map(line => `• ${line}`).join('\n');
}
