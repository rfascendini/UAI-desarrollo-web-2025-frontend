const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export type FieldErrors = Record<string, string[]>;

type ErrorPayload = {
  message?: string;
  errors?: FieldErrors;
};

export class ApiError extends Error {
  status: number;
  errors: FieldErrors;

  constructor(message: string, status = 0, errors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const fallbackMessage = 'No se pudo completar la operación.';

function isFieldErrors(value: unknown): value is FieldErrors {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every(
    (item) => Array.isArray(item) && item.every((message) => typeof message === 'string')
  );
}

async function parseJson(response: Response): Promise<ErrorPayload> {
  return response.json().catch(() => ({}));
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      data.message || fallbackMessage,
      response.status,
      isFieldErrors(data.errors) ? data.errors : {}
    );
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(`${API_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export async function publicApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(`${API_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}
