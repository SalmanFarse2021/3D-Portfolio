'use client';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import ProjectGrid from '@/components/ProjectGrid';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import AIChatSidebar from '@/components/AIChatSidebar';

export default function Home() {
    return (
        <main className="bg-gray-900 min-h-screen text-white">
            <Navigation />

            <section id="home">
                <Hero />
            </section>

            <Skills />

            <Experience />

            <ProjectGrid />

            <Contact />

            <Footer />

            {/* Global Interactive Components */}
            <AIChatSidebar />
        </main>
    );
}
