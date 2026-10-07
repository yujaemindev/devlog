export const assetPath = (baseURL, asset) => {
  const normalizedBase = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  const normalizedAsset = asset.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedAsset}`;
};
