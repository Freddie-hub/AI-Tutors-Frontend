import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  // In the browser, DOMPurify will use window; in SSR this file should not be used.
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'id', 'class', 'style'],
    ALLOWED_TAGS: [
      'a','b','i','em','strong','p','br','ul','ol','li','h1','h2','h3','h4','h5','h6',
      'blockquote','code','pre','span','div','img','table','thead','tbody','tr','th','td','hr'
    ],
  });
}
