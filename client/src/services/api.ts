const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('consultflow_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response from server.',
    }));
  } else {
    const rawText = await response.text().catch(() => '');
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        success: response.ok,
        message: rawText || (response.ok ? 'Success' : `Server responded with status ${response.status}`),
      };
    }
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
