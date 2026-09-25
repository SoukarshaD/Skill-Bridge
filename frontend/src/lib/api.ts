const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
};

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, token } = options;

  const config: RequestInit = {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    credentials: "include",
  };

  if (body && method !== "GET") {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
      (config.headers as Record<string, string>)["Content-Type"] = "application/json";
    }
  }

  if (endpoint.includes("/skills")) {
    // console.log(`SKILL TRACE 5 - API request body [${method} ${endpoint}]:`, config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || "An error occurred",
      data.errors
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
};

export { ApiError };
export default api;
