import { useEffect, useMemo, useState } from "react";
import { fetchMaterials, fetchCostFactors } from "../services/apiService";
import { calculateCostWeb } from "../utils/pricingUtils";
import {
  findMaterialContains,
  findMaterialExact,
  firstVariantId,
  normalize,
  safeId,
} from "../utils/materialUtils";
import { calcFinalFrameSize, parseThicknessToInches, parseSizeWH, clamp } from "../utils/sizeUtils";

export function useMaterialsPricing({ baseArtSizeText, printPrice = 0, printCost = 0,selectedFrame }) {
  // ✅ default NO MAT
  const [selectedMatWidth, setSelectedMatWidth] = useState(null); // Variant
  const [selectedMatColor, setSelectedMatColor] = useState(null); // Variant

  const matInches = parseThicknessToInches(selectedMatWidth?.thickness ?? "0");

  // final frame size depends on mat inches
  const finalFrameSize = useMemo(() => {
    return matInches ? calcFinalFrameSize(baseArtSizeText, matInches) : baseArtSizeText;
  }, [baseArtSizeText, matInches]);

  // For preview stage aspect ratio
  const { w: outW, h: outH } = useMemo(() => parseSizeWH(finalFrameSize), [finalFrameSize]);

  const mountPaddingPx = clamp(60 + matInches * 60, 10, 80);

  // pricing data
  const [materials, setMaterials] = useState([]);
  const [costFactors, setCostFactors] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [mats, factors] = await Promise.all([fetchMaterials(), fetchCostFactors()]);
        if (!alive) return;
        setMaterials(Array.isArray(mats) ? mats : []);
        setCostFactors(factors || null);
      } catch (e) {
        console.error("Failed to load materials/cost factors:", e);
        if (!alive) return;
        setMaterials([]);
        setCostFactors(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Material mapping (Mount Color / Mount Size)
  const mountColorMaterial = useMemo(() => {
    return findMaterialContains(materials, "mount color") || findMaterialExact(materials, "Mount Color");
  }, [materials]);

  const mountSizeMaterial = useMemo(() => {
    return (
      findMaterialContains(materials, "mount size") ||
      findMaterialContains(materials, "mount width") ||
      findMaterialExact(materials, "Mount Size")
    );
  }, [materials]);

  // fallback variants for mats if API not returning
  const matWidthVariants = useMemo(() => {
    const v = mountSizeMaterial?.variants;
    if (Array.isArray(v) && v.length) return v;

    return [
      { _id: "mw0", thickness: '0"', price: 0, unit: "per item" },
      { _id: "mw1", thickness: '1"', price: 0, unit: "per item" },
      { _id: "mw2", thickness: '2"', price: 0, unit: "per item" },
      { _id: "mw3", thickness: '3"', price: 0, unit: "per item" },
      { _id: "mw4", thickness: '4"', price: 0, unit: "per item" },
      { _id: "mw5", thickness: '5"', price: 0, unit: "per item" },
    ];
  }, [mountSizeMaterial]);

  const matColorVariants = useMemo(() => {
    const v = mountColorMaterial?.variants;
    if (Array.isArray(v) && v.length) return v;

    return [
      { _id: "mc1", thickness: "White", price: 0, unit: "per item" },
      { _id: "mc2", thickness: "Off White", price: 0, unit: "per item" },
      { _id: "mc3", thickness: "Black", price: 0, unit: "per item" },
    ];
  }, [mountColorMaterial]);

  // Build selectedVariants like Dart
  const selectedVariants = useMemo(() => {
    const sel = {};

    if (selectedMatColor && mountColorMaterial) {
      sel[safeId(mountColorMaterial)] = safeId(selectedMatColor);
    }
    if (selectedMatWidth && mountSizeMaterial) {
      sel[safeId(mountSizeMaterial)] = safeId(selectedMatWidth);
    }

    for (const fixed of ["Glass", "Acrylic", "Wood Board", "Hanging Hardware"]) {
      const m = findMaterialExact(materials, fixed);
      if (!m) continue;
      const mId = safeId(m);
      sel[mId] = sel[mId] || firstVariantId(m);
    }

    return sel;
  }, [materials, selectedMatColor, selectedMatWidth, mountColorMaterial, mountSizeMaterial]);

  // Pricing
  const pricing = useMemo(() => {
    if (!materials.length || !costFactors) return { totalCost: null, selling: null };
    return calculateCostWeb({
      artSize: finalFrameSize,
      selectedVariants,
      materials,
      costFactors,
      frame: selectedFrame,
    });
  }, [materials, costFactors, finalFrameSize, selectedVariants,selectedFrame]);

  // Add print costs/prices like your combined logic
  const combined = useMemo(() => {
    const baseSell = Number(pricing?.selling ?? 0);
    const baseCost = Number(pricing?.totalCost ?? 0);

    const pSell = Number(printPrice || 0);
    const pCost = Number(printCost || 0);
console.log("🧾 PRICING DEBUG", {
  finalFrameSize,
  baseSell,
  baseCost,
  printPrice: pSell,
  printCost: pCost,
  combinedSelling: baseSell + pSell,
  combinedCost: baseCost + pCost,
  selectedVariants,
  selectedFrame,
});

    return {
      selling: pricing?.selling == null ? null : baseSell + pSell,
      totalCost: pricing?.totalCost == null ? null : baseCost + pCost,
    };
  }, [pricing, printPrice, printCost]);

  return {
    materials,
    costFactors,

    mountColorMaterial,
    mountSizeMaterial,

    matWidthVariants,
    matColorVariants,

    selectedMatWidth,
    setSelectedMatWidth,
    selectedMatColor,
    setSelectedMatColor,

    matInches,
    finalFrameSize,
    outW,
    outH,
    mountPaddingPx,

    selectedVariants,
    pricing,
    combined,
  };
}
