function getApiBase() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
  const isLocalhost = !raw || raw.includes('localhost');
  if (process.env.NODE_ENV === 'production' && isLocalhost) {
    return '';
  }
  return raw || 'http://localhost:5000';
}

const API_BASE = getApiBase();

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('muis_token') || '';
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('muis_token', token);
  else localStorage.removeItem('muis_token');
}

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function api(path, options = {}) {
  const { method = 'GET', body, formData, token } = options;
  const headers = {};
  if (!formData) headers['Content-Type'] = 'application/json';
  const auth = token || getToken();
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let res;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      method,
      headers,
      credentials: 'include',
      body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Cannot reach the MUIS server. Please try again in a moment.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed. Please try again.', res.status);
  }
  return data;
}

export function mapEvent(doc) {
  if (!doc) return null;
  return {
    id: doc.slug || doc.id,
    slug: doc.slug || doc.id,
    category: doc.category,
    badge: doc.badge,
    image: doc.image,
    title: doc.title,
    date: doc.date,
    time: doc.time || '',
    location: doc.location,
    description: doc.description,
    isUpcoming: doc.isUpcoming
  };
}

export function mapCourse(doc) {
  if (!doc) return null;
  return {
    id: doc.slug || doc.id,
    slug: doc.slug || doc.id,
    title: doc.title,
    type: doc.type,
    duration: doc.duration,
    instructor: doc.instructor,
    schedule: doc.schedule,
    venue: doc.venue,
    description: doc.description,
    summary: doc.summary,
    syllabus: doc.syllabus || [],
    archived: doc.archived,
    materialsAvailable: doc.materialsAvailable
  };
}

export function mapMagazine(doc) {
  if (!doc) return null;
  return {
    id: doc.slug || doc.id,
    slug: doc.slug || doc.id,
    title: doc.title,
    issue: doc.issue,
    date: doc.date,
    cover: doc.cover,
    description: doc.description,
    downloadLink: doc.downloadUrl || '',
    downloadUrl: doc.downloadUrl || '',
    pagesCount: doc.pagesCount,
    featuredArticles: doc.featuredArticles || []
  };
}
