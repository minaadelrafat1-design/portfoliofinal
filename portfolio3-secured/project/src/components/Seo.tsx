import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export function Seo({ title, description, image, url }: SeoProps) {
  useEffect(() => {
    document.title = title;
    const set = (name: string, attr: 'name' | 'property', content: string) => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    if (description) {
      set('description', 'name', description);
      set('og:description', 'property', description);
      set('twitter:description', 'name', description);
    }
    set('og:title', 'property', title);
    set('twitter:title', 'name', title);
    if (image) {
      set('og:image', 'property', image);
      set('twitter:image', 'name', image);
    }
    if (url) {
      set('og:url', 'property', url);
      const canon = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canon) {
        const c = document.createElement('link');
        c.rel = 'canonical';
        c.href = url;
        document.head.appendChild(c);
      } else {
        canon.href = url;
      }
    }
  }, [title, description, image, url]);

  return null;
}
