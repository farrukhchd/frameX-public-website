import { useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "../utils/materialUtils";
import { makeTransparentPngDataUrlForAspect, resolveToSrc } from "../utils/imageUtils";

export function usePreviewImages({
  service,
  artType,
  baseArtSizeText,
  imageUrls = [],
  localImages = [],
  page,
  setPage,
}) {
  const isEmptyFrame =
    normalize(artType).includes("empty") || normalize(service).includes("empty");

  // cleanup object URLs
  const objectUrlsToRevoke = useRef([]);

  const previewSources = useMemo(() => {
    // cleanup previous object URLs
    objectUrlsToRevoke.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsToRevoke.current = [];

    // 1) If imageUrls were passed, use them directly
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls.filter(Boolean);
    }

    // 2) fallback: build URLs from Blobs (File is Blob)
    if (Array.isArray(localImages) && localImages.length > 0) {
      const list = localImages
        .map((img) => {
          const src = resolveToSrc(img);
          if (src && typeof img !== "string" && src.startsWith("blob:")) {
            objectUrlsToRevoke.current.push(src);
          }
          return src;
        })
        .filter(Boolean);

      return list;
    }

    return [];
  }, [imageUrls, localImages]);

  useEffect(() => {
    return () => {
      objectUrlsToRevoke.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsToRevoke.current = [];
    };
  }, []);

  // reset page if number of preview images changes
  useEffect(() => {
    setPage(0);
  }, [previewSources.length, setPage]);

  // blank placeholder for empty frame or no images
  const [blankUrl, setBlankUrl] = useState("");
  useEffect(() => {
    let mounted = true;

    async function prepBlank() {
      if (!isEmptyFrame && previewSources.length > 0) return;
      const url = await makeTransparentPngDataUrlForAspect(baseArtSizeText, 1200);
      if (mounted) setBlankUrl(url);
    }

    prepBlank();
    return () => {
      mounted = false;
    };
  }, [isEmptyFrame, baseArtSizeText, previewSources.length]);

  const finalPreviewImages =
    previewSources.length > 0 ? previewSources : blankUrl ? [blankUrl] : [];

  const activePhoto =
    finalPreviewImages[page] || "https://placehold.co/1200x900?text=Your+Photo";

  const borderOverlayFrom = (selectedFrame) =>
    selectedFrame?.borderImage || selectedFrame?.border_image || null;

  const model3dUrlFrom = (selectedFrame) =>
    selectedFrame?.model3d || selectedFrame?.model_3d || null;

  return {
    isEmptyFrame,
    previewSources,
    finalPreviewImages,
    activePhoto,
    borderOverlayFrom,
    model3dUrlFrom,
  };
}
