
import HeroSection from "./HeroSection";
import StoryTimeline from "./StoryTimeline";
import MapSection from "./MapSection";
import RSVPSection from "./RSVPSection";
import GallerySection from "./GallerySection";
import CurtainIntro from "./CurtainIntro";
import ScrollReveal  from "./ScrollReveal";
import StoryBook    from "./StoryBook"; 
export default function App() {
  return (
    <CurtainIntro>
      <HeroSection />
      <StoryBook />                          {/* ← thay StoryTimeline */}
      <GallerySection />
      <MapSection />
      <RSVPSection />
    </CurtainIntro>
  );
}