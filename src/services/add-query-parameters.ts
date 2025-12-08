const addQueryParameters = (
  uri: string,
  params: Record<string, string | undefined>,
) => {
  const filteredParams = Object.entries(params).filter(([, value]) => !!value);

  if (filteredParams.length === 0) {
    return uri;
  }

  const objParams = filteredParams.reduce(
    (acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    },
    {} as Record<string, string>,
  );

  const searchParams = new URLSearchParams(objParams);
  return `${uri}?${searchParams.toString()}`;
};

export { addQueryParameters };
