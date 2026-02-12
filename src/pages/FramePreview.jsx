 import React, { useEffect, useState } from "react";
 import { useLocation, useNavigate, useParams } from "react-router-dom";
 import SiteHeader from "../components/SiteHeader";

 import "../styles/frame-preview.css";
  import "../styles/frame-preview-modern.css";
 import "../styles/meta-strip.css";
 // hooks
 import { usePreviewImages } from "../hooks/usePreviewImages";
 import { useMaterialsPricing } from "../hooks/useMaterialsPricing";
 import { useAddToCart } from "../hooks/useAddToCart";

 // components
 import PreviewStage from "../components/PreviewStage";
 import FrameInfoCard from "../components/FrameInfoCard";
 import MatWidthSelector from "../components/MatWidthSelector";
 import MatColorSelector from "../components/MatColorSelector";
 import PriceCard from "../components/PriceCard";
import FrameGridPicker from "../components/FrameGridPicker";

 export default function FramePreview() {
   const navigate = useNavigate();
   const { service } = useParams();
   const { state: payload } = useLocation();

   useEffect(() => {
     if (!payload?.frame) navigate("/start-framing", { replace: true });
   }, [payload, navigate]);

   if (!payload?.frame) return null;

   const {
     artType = "Photo Frame",
     artSize = "4x6",
     selectedSize,
     quantity = 1,
     frame: initialFrame,
     printPrice = 0,
     printCost = 0,
     imageUrls = [],
     localImages = [],
   } = payload;

   const baseArtSizeText = selectedSize?.size || artSize;

   // UI state
   const [mode, setMode] = useState("preview");
   const [page, setPage] = useState(0);
   const [selectedFrame, setSelectedFrame] = useState(initialFrame);

   // Preview
   const preview = usePreviewImages({
     service,
     artType,
     baseArtSizeText,
     imageUrls,
     localImages,
     page,
     setPage,
   });

   // Pricing
   const pricingState = useMaterialsPricing({
     baseArtSizeText,
     printPrice,
     printCost,
     selectedFrame,
   });

   // Add to cart
   const cart = useAddToCart({
     payload,
     service,
     artType,
     artSize,
     selectedSize,
     quantity,
     selectedFrame,
     finalFrameSize: pricingState.finalFrameSize,

     previewSources: preview.previewSources,
     finalPreviewImages: preview.finalPreviewImages,

     materials: pricingState.materials,
     selectedVariants: pricingState.selectedVariants,
     pricing: pricingState.pricing,
     combined: pricingState.combined,
     isEmptyFrame: preview.isEmptyFrame,

     mountPaddingPx: pricingState.mountPaddingPx,

     imageUrls,
     localImages,
   });

   return (
     <div className="fp3-page">
       <SiteHeader />

       <div className="fp3-shell">
         <div className="fp3-gridModern">
           {/* LEFT */}
           <div className="fp3-left">
             <PreviewStage
               mode={mode}
               setMode={setMode}
               finalPreviewImages={preview.finalPreviewImages}
               activePhoto={preview.activePhoto}
               page={page}
               setPage={setPage}
               quantity={quantity}
               borderOverlay={preview.borderOverlayFrom(selectedFrame)}
               model3dUrl={preview.model3dUrlFrom(selectedFrame)}
               finalFrameSize={pricingState.finalFrameSize}
               matInches={pricingState.matInches}
               mountPaddingPx={pricingState.mountPaddingPx}
               selectedMatColor={pricingState.selectedMatColor}
             />
           </div>

           {/* RIGHT */}
           <div className="fp3-right">
             <div className="fp3-panelModern">
               <FrameInfoCard
                 service={service}
                 selectedFrame={selectedFrame}
                 baseArtSizeText={baseArtSizeText}
                 finalFrameSize={pricingState.finalFrameSize}
               />

              <FrameGridPicker
                selectedFrame={selectedFrame}
                onSelect={(frame) => setSelectedFrame(frame)}
                title="Frames"
                subtitle="Select a frame to update your preview."
              />

               <MatWidthSelector
                 matWidthVariants={pricingState.matWidthVariants}
                 selectedMatWidth={pricingState.selectedMatWidth}
                 setSelectedMatWidth={pricingState.setSelectedMatWidth}
                 setSelectedMatColor={pricingState.setSelectedMatColor}
                 matInches={pricingState.matInches}
               />

               <MatColorSelector
                 matColorVariants={pricingState.matColorVariants}
                 selectedMatColor={pricingState.selectedMatColor}
                 setSelectedMatColor={pricingState.setSelectedMatColor}
                 matInches={pricingState.matInches}
               />

               <PriceCard
                 total={pricingState.combined?.selling}
                 uploading={cart.uploading}
                 uploadProgress={cart.uploadProgress}
                 onAddToCart={cart.onAddToCart}
               />
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }
