export function getStoragePath(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const marker = "/storage/v1/object/public/product-images/";
    const index = parsedUrl.pathname.indexOf(marker);

    if (index === -1) {
      console.error("Invalid image URL:", url);
      return null;
    }

    return decodeURIComponent(parsedUrl.pathname.slice(index + marker.length));
  } catch (error) {
    console.error("Failed to parse image URL:", error);
    return null;
  }
}
