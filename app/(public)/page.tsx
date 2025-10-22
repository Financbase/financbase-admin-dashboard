import ModernHero from "@/components/core/ui/layout/modern-hero";
import { FeaturesSectionMinimal } from "@/components/core/ui/layout/bento-monochrome";
import OverviewStats from "@/components/core/overview-stats";

export default function Home() {
  return (
    <>
      <ModernHero />
      <FeaturesSectionMinimal />
      <OverviewStats />
    </>
  );
}
