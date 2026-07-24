import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Seo } from '@/components/Seo';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Skills } from '@/components/public/Skills';
import { Projects } from '@/components/public/Projects';
import { Services } from '@/components/public/Services';
import { Contact } from '@/components/public/Contact';
import type { Profile, Skill, Service, Project } from '@/lib/types';
import { fetchProfile, fetchSkills, fetchServices, fetchPublishedProjects } from '@/lib/api';

export function PublicSite() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    (async () => {
      const [p, s, sv, pr] = await Promise.all([
        fetchProfile(),
        fetchSkills().catch(() => []),
        fetchServices().catch(() => []),
        fetchPublishedProjects().catch(() => []),
      ]);
      setProfile(p);
      setSkills(s);
      setServices(sv);
      setProjects(pr);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Seo
        title={profile ? `${profile.name} — ${profile.title}` : 'Portfolio'}
        description={profile?.bio || undefined}
        image={profile?.profile_image_url || undefined}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navbar />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Services services={services} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
