import { useCallback, useState } from "react";

import CartStore from "../store/CartStore";
import CartItem from "../models/CartItem";
import CartMaterial from "../models/CartMaterial";

import uploadToS3 from "../services/uploadToS3";
import { showCartSheet } from "../components/CartBottomSheet";

import { safeId, findMaterialExact } from "../utils/materialUtils";
import { toUploadFile } from "../utils/imageUtils";

export function useAddToCart({
  payload,
  service,
  artType,
  artSize,
  selectedSize,
  quantity,
  selectedFrame,
  finalFrameSize,

  previewSources,
  finalPreviewImages,

  materials,
  selectedVariants,
  pricing,
  combined,
  isEmptyFrame,

  imageUrls,
  localImages,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const buildCartMaterials = useCallback(() => {
    if (!Array.isArray(materials) || materials.length === 0) return [];

    return materials.map((m) => {
      const mId = safeId(m);
      const chosenId = selectedVariants?.[mId];
      const v =
        (m.variants || []).find((x) => safeId(x) === chosenId) || (m.variants || [])[0];

      return new CartMaterial({
        name: m.name || "",
        variant: v?.thickness || v?.unit || "",
      });
    });
  }, [materials, selectedVariants]);

  const onAddToCart = useCallback(async () => {
    const cartMaterials = buildCartMaterials();

    const emptyNoImage =
      isEmptyFrame || (Array.isArray(previewSources) && previewSources.length === 0);

    // EMPTY frame OR no images => no uploads
    if (emptyNoImage) {
      const item = CartItem.emptyFrame({
        frameSize: finalFrameSize,
        moulding: selectedFrame,
        tthumb: selectedFrame?.cornerImage || selectedFrame?.corner_image || "",
        costPrice: Number(combined?.totalCost || 0),
        sellingPrice: Number(combined?.selling || 0),
        profit: Number(combined?.selling || 0) - Number(combined?.totalCost || 0),
        quantity: Number(quantity || 1),
      });

      CartStore.addItem(item);
      showCartSheet();
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const sources =
        Array.isArray(previewSources) && previewSources.length > 0
          ? previewSources
          : Array.isArray(imageUrls)
          ? imageUrls
          : [];

      if (sources.length === 0) {
        alert("No images found to upload. Please go back and select photos again.");
        return;
      }

      const uploadedUrls = [];

      for (let i = 0; i < sources.length; i++) {
        // ✅ Prefer original File/Blob from localImages if present
        const file = await toUploadFile(
          Array.isArray(localImages) ? localImages[i] : null,
          sources[i],
          `framex_${Date.now()}_${i}`
        );

        const url = await uploadToS3(file, "cart-uploads");
        uploadedUrls.push(url);

        const pct = Math.round(((i + 1) / sources.length) * 100);
        setUploadProgress(pct);
      }

      const thumb = uploadedUrls[0] || "";

      // one cart item per image
      uploadedUrls.forEach((url) => {
        const item = new CartItem({
          productType: artType,
          size: selectedSize?.size || artSize,
          frameSize: finalFrameSize,
          materials: cartMaterials,
          moulding: selectedFrame,
          image: url,
          thumb,
          costPrice: Number(pricing?.totalCost || 0),
          sellingPrice: Number(pricing?.selling || 0),
          profit: Number(pricing?.selling || 0) - Number(pricing?.totalCost || 0),
          quantity: 1,
        });

        CartStore.addItem(item);
      });

      showCartSheet();
    } catch (e) {
      console.error(e);
      alert(`❌ Failed to upload images: ${e?.message || e}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [
    buildCartMaterials,
    isEmptyFrame,
    previewSources,
    imageUrls,
    localImages,
    finalFrameSize,
    selectedFrame,
    combined,
    quantity,
    artType,
    selectedSize,
    artSize,
    pricing,
  ]);

  return { onAddToCart, uploading, uploadProgress };
}
