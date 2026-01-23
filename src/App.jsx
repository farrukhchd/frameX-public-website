import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StartFramingStep1 from "./pages/StartFramingStep1";
import SizeSelection from "./pages/SizeSelection";
import QuantityStep from "./pages/QuantityStep";
import PhotoSelection from "./pages/PhotoSelection";
import CropImages from "./pages/CropImages";
import FrameSelection from "./pages/FrameSelection";
import FramePreview from "./pages/FramePreview";
import CartBottomSheet from "./components/CartBottomSheet";
import Checkout from "./pages/Checkout";
export default function App() {
  return (
    <BrowserRouter>
      <CartBottomSheet />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start-framing" element={<StartFramingStep1 />} />
        <Route path="/start-framing/size/:service" element={<SizeSelection />} />
        <Route path="/start-framing/quantity/:service" element={<QuantityStep />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* NEW */}
        <Route path="/start-framing/photos/:service" element={<PhotoSelection />} />
        <Route path="/start-framing/crop/:service" element={<CropImages />} />
        <Route path="/start-framing/frame-preview/:service" element={<FramePreview />} />
        <Route path="/start-framing/frames/:service" element={<FrameSelection />} />
        
      </Routes>
    </BrowserRouter>
  );
}
