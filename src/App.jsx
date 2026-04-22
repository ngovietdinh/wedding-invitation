
import HeroSection from "./HeroSection";
import StoryTimeline from "./StoryTimeline";
import MapSection from "./MapSection";
import RSVPSection from "./RSVPSection";
import GallerySection from "./GallerySection";
import CurtainIntro from "./CurtainIntro";
import ScrollReveal  from "./ScrollReveal";

export default function App() {
  return (
    <CurtainIntro>

      {/* Hero không cần ScrollReveal — nó là trang đầu */}
      <HeroSection />

      {/* Mỗi section bên dưới bọc ScrollReveal */}
      <ScrollReveal>
        <StoryTimeline />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <GallerySection />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <MapSection />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <RSVPSection />
      </ScrollReveal>

    </CurtainIntro>
  );
}