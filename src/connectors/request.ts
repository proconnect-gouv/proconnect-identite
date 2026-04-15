import axios from "axios";

class FetchError extends Error {}

async function request<responseT>(
  url: string,
  options?: {
    headers?: Record<string, string>;
    method?: string;
    timeout?: number;
  },
): Promise<{ data: responseT }> {
  try {
    const res = await axios({
      url,
      headers: options?.headers,
      method: options?.method,
      timeout: options?.timeout ?? 30000,
    });
    return { data: res.data as responseT };
  } catch (error) {
    throw new FetchError(
      error instanceof Error ? error.message : String(error),
    );
  }
}

export { FetchError, request };
