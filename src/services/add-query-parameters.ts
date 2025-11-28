const addQueryParameters = (
  uri: string,
  params: Record<string, string | undefined>,
) => {
  let isThereAtLeastOneTruthyParam = false;
  for (const [key, value] of Object.entries(params)) {
    if (!!value) {
      if (isThereAtLeastOneTruthyParam) {
        uri += "&";
      } else {
        uri += "?";
        isThereAtLeastOneTruthyParam = true;
      }
      uri += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }
  return uri;
};

export { addQueryParameters };
