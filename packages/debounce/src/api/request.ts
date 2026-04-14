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
    const res = await fetch(url, {
      headers: options?.headers,
      method: options?.method,
      signal: AbortSignal.timeout(options?.timeout ?? 30_000),
    });
    if (!res.ok) {
      const response = await res.text();
      throw new FetchError(response);
    }
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return { data: (await res.json()) as responseT };
    }
    return { data: (await res.text()) as unknown as responseT };
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    throw new FetchError(
      error instanceof Error ? error.message : String(error),
    );
  }
}

export { FetchError, request };
