const API_BASE = '/api';

export const api = {
  async get(path: string, options: any = {}) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error('API Error');
    if (options.responseType === 'blob') {
      return res.blob();
    }
    return res.json();
  },
  async post(path: string, data: any, options: any = {}) {
    const isFormData = data instanceof FormData;
    const headers = { ...options.headers };
    
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        let message = 'API Error';
        try {
            const errorData = JSON.parse(text);
            message = errorData.message || message;
        } catch (e) {
            message = `Server Error (${res.status}): ${text.substring(0, 50)}`;
        }
        throw new Error(message);
    }
    return res.json();
  },
  async put(path: string, data: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
  async delete(path: string, queryParams?: Record<string, string>) {
    let url = `${API_BASE}${path}`;
    if (queryParams) {
      const searchParams = new URLSearchParams(queryParams);
      url += `?${searchParams.toString()}`;
    }
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
};
