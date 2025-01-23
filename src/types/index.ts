export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
  features: string[];
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  name: string;
  avatar?: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedAt: string;
  image?: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}