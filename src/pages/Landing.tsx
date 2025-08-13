import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Testimonials from "@/components/landing/Testimonials";

export default function Landing() {
  return (
    <div className="bg-neutral-950 text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
