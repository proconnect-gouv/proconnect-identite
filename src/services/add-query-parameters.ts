import { omitBy } from "lodash-es";

const addQueryParameters = (
  uri: string,
  params: Record<string, string | undefined>,
) => {
  const filteredParams = omitBy(params, (value) => !value) as Record<
    string,
    string
  >;

  if (Object.keys(filteredParams).length === 0) {
    return uri;
  }

  const searchParams = new URLSearchParams(filteredParams);
  return `${uri}?${searchParams.toString()}`;
};

export { addQueryParameters };
