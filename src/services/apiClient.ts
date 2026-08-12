import { getSession, clearSession } from "../utils/authStorage";

const API_BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || "/api/v1";

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * A wrapper around native fetch that automatically injects the access token
 * and handles generic errors (like 401 Unauthorized).
 */
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const session = getSession();
  const token = session?.accessToken || localStorage.getItem("accessToken");

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearSession();
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; // Force redirect to login on 401
      throw new ApiError("Unauthorized", 401);
    }

    // Attempt to parse JSON response
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => ({}));
    } else {
      data = await response.text().catch(() => "");
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    // Return the .data property if it's wrapped in a standard JSend format { success, data }
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
       return data.data;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Network error");
  }
};
