import axios from 'axios';

export async function adminFetchAnalytics() {
  const res = await axios.get('/backend/blogs/admin/analytics');
  return res.data;
}

export async function adminFetchBlogs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const res = await axios.get(`/backend/blogs/admin/list?${search.toString()}`);
  return res.data;
}

export async function adminFetchBlog(id) {
  const res = await axios.get(`/backend/blogs/admin/${id}`);
  return res.data;
}

export async function adminCreateBlog(data) {
  const form = buildFormData(data);
  const res = await axios.post('/backend/blogs/admin/create', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function adminUpdateBlog(id, data) {
  const form = buildFormData(data);
  const res = await axios.put(`/backend/blogs/admin/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function adminPublishBlog(id) {
  const res = await axios.post(`/backend/blogs/admin/${id}/publish`);
  return res.data;
}

export async function adminUnpublishBlog(id) {
  const res = await axios.post(`/backend/blogs/admin/${id}/unpublish`);
  return res.data;
}

export async function adminDuplicateBlog(id) {
  const res = await axios.post(`/backend/blogs/admin/${id}/duplicate`);
  return res.data;
}

export async function adminDeleteBlog(id) {
  await axios.delete(`/backend/blogs/admin/${id}`);
}

export async function adminUploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await axios.post('/backend/blogs/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

const ALLOWED_BLOG_FIELDS = new Set([
  'title',
  'subtitle',
  'slug',
  'excerpt',
  'content',
  'category',
  'tags',
  'status',
  'isFeatured',
  'coverImage',
  'coverImageAlt',
  'author',
  'seo',
  'faq',
  'relatedSlugs',
  'scheduledAt',
]);

function buildFormData(data) {
  const form = new FormData();
  const jsonFields = ['content', 'tags', 'seo', 'faq', 'relatedSlugs', 'author'];

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'coverImageFile' && value instanceof File) {
      form.append('coverImage', value);
      return;
    }
    // Never send mongoose metadata / counters back into create/update
    if (!ALLOWED_BLOG_FIELDS.has(key)) return;
    if (jsonFields.includes(key)) {
      form.append(key, JSON.stringify(value));
      return;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      form.append(key, String(value));
      return;
    }
    form.append(key, value);
  });

  return form;
}

export const EMPTY_BLOG = {
  title: '',
  subtitle: '',
  slug: '',
  excerpt: '',
  content: [{ type: 'paragraph', text: '' }],
  category: '',
  tags: [],
  status: 'draft',
  isFeatured: false,
  coverImage: '',
  coverImageAlt: '',
  author: { name: '', role: 'Route2Hire Team', avatar: '' },
  seo: { metaTitle: '', metaDescription: '', keywords: [], ogImage: '' },
  faq: [],
  relatedSlugs: [],
};
