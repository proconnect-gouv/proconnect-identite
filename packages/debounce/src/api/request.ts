class FetchError extends Error {}

async function request<responseT>(
  url: string,
  options?: {
    headers?: Record<string, string>;
    method?: string;
    timeout?: number;
  },
): Promise<{ data: responseT }> {
   AbortSignal.timeout(options?.timeout ?? 30_000)

  try {
    const res = await fetch(url, {
      headers: options?.headers,
      method: options?.method,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new FetchError(res.statusText);
    }
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return { data: (await res.json()) as responseT };
    }
    return { data: (await res.text()) as unknown as responseT };
  } catch (error) {
    throw new FetchError(
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export { FetchError, request };
