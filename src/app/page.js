import HeroSection from '@/components/home/HeroSection';
import StatementSection from '@/components/home/StatementSection';
import XoInActionSection from '@/components/home/XoInActionSection';
import CalculatorSection from '@/components/home/CalculatorSection';
import ServicesSection from '@/components/home/ServicesSection';
import FeaturedHomesSection from '@/components/home/FeaturedHomesSection';
import LanguagesSection from '@/components/home/LanguagesSection';
import EcosystemSection from '@/components/home/EcosystemSection';
import PartnersSection from '@/components/home/PartnersSection';
import ClosingSection from '@/components/home/ClosingSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatementSection />
      <XoInActionSection />
      <CalculatorSection />
      <ServicesSection />
      <FeaturedHomesSection />
      <LanguagesSection />
      <EcosystemSection />
      <PartnersSection />
      <ClosingSection />
    </>
  );
}
