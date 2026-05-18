import { useEffect, useState, useRef } from "react";
import Cover from "./Cover";
import SidebarNav from "./SidebarNav";
import MobileTopBar from "./MobileTopBar";
import About from "./About";

import Projects from "./Projects";
import ProjectPage from "./ProjectPage";
import PublicationPage from "./PublicationPage";
import Publications from "./Publications";
import Activities from "./Activities";
import Skills from "./Skills";
import Experience from "./Experience";
import Education from "./Education";
import Contact from "./Contact";

import { getSectionStyleVars, getSectionTheme, sections } from "../config/sections";
import { heroBackgroundStyle } from "../config/heroTheme";
import { cover } from "@datapack/cover";
import { sources } from "../data/sources";

export default function Layout() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionIds = new Set(sections.map((s) => s.id));
  const [isPastHero, setIsPastHero] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [focusedSkill, setFocusedSkill] = useState(null);
  const [focusedCompany, setFocusedCompany] = useState(null);
  const [focusedActivity, setFocusedActivity] = useState(null);
  const [focusedActivityId, setFocusedActivityId] = useState(null);
  const [focusedProjectFilters, setFocusedProjectFilters] = useState(null);
  // Academic filter for Education → Projects
  const [focusedAcademic, setFocusedAcademic] = useState(null);
  // Focus filters for Skills (applied when jumping to Skills section)
  const [focusedSkillFilters, setFocusedSkillFilters] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedPublicationId, setSelectedPublicationId] = useState(null);
  const prevBodyStyles = useRef({ overflow: "", paddingRight: "", locked: false });
  const [focusedCompanyId, setFocusedCompanyId] = useState(null);
  const [focusedSchoolId, setFocusedSchoolId] = useState(null);
  const [focusedSkillId, setFocusedSkillId] = useState(null);
  const showProjectsForAcademic = (schoolId) => {
    setFocusedAcademic(schoolId);
    jumpTo("projects");
  };

  useEffect(() => {
    const sentinel = document.getElementById("cover-content-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHero(!entry.isIntersecting),
      { threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling) return;

      // Choose the section that currently has the largest visible height
      let bestId = sections[0].id;
      let bestVisible = -1;

      const vh = window.innerHeight || document.documentElement.clientHeight;

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        // compute visible vertical overlap between element and viewport
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, vh);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > bestVisible) {
          bestVisible = visibleHeight;
          bestId = s.id;
        }
      }

      // Always update active section (React will bail out if same)
      setActiveSection(bestId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isManualScrolling]);

  const jumpTo = (id) => {
    setIsManualScrolling(true);
    setActiveSection(id);

    const el = document.getElementById(id);
    if (!el) return;

    // Use explicit scrollTo with computed absolute offset for better
    // reliability across mobile browsers (address bar, transforms, etc.)
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    // Subtract any visible sticky header (mobile top bar) height so the
    // target section isn't hidden under it after layout shifts.
    const mobileBar = document.getElementById("mobile-top-bar");
    const headerOffset = mobileBar ? mobileBar.offsetHeight : 0;
    const target = Math.max(0, absoluteTop - headerOffset);
    window.scrollTo({ top: target, behavior: "smooth" });

    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setIsManualScrolling(false);
        window.removeEventListener("scroll", onScroll);
      }, 600);
    };

    window.addEventListener("scroll", onScroll);
  };

  const showProjectsForSkill = (skillId) => {
    setFocusedSkill(skillId);
    jumpTo("projects");
  };
  const showSkillsForCompany = (companyId) => {
    setFocusedSkillFilters({ professional: [companyId], academic: [], personal: false });
    jumpTo("skills");
  };
  const showSkillsForAcademic = (schoolId) => {
    setFocusedSkillFilters({ professional: [], academic: [schoolId], personal: false });
    jumpTo("skills");
  };
  const showProjectsForCompany = (companyId) => {
    setFocusedCompany(companyId);
    jumpTo("projects");
  };
  const showProjectsForActivity = (activityTitle) => {
    setFocusedActivity(activityTitle);
    jumpTo("projects");
  };
  const showProjectsForFilters = (filters) => {
    setFocusedProjectFilters(filters);
    jumpTo("projects");
  };

  // Open a specific project (scroll to projects and open the project page)
  const showProject = (projectId) => {
    if (!projectId) return;
    if (activeSection === "projects") {
      setSelectedProjectId(projectId);
      return;
    }

    jumpTo("projects");
    // allow scroll animation to start before opening the modal
    setTimeout(() => setSelectedProjectId(projectId), 420);
  };

  // Open a specific publication page
  const showPublication = (pubId) => {
    if (!pubId) return;
    if (activeSection === "publications") {
      setSelectedPublicationId(pubId);
      return;
    }
    jumpTo("publications");
    setTimeout(() => setSelectedPublicationId(pubId), 420);
  };

  const showCompany = (companyId) => {
    setFocusedCompanyId(companyId);
    jumpTo("experience");
  };
  const showSchool = (schoolId) => {
    setFocusedSchoolId(schoolId);
    jumpTo("education");
  };
  const showSkillById = (skillId) => {
    setFocusedSkillId(skillId);
    jumpTo("skills");
  };

  // Generic handler for link objects that point to projects/activities/sections
  const handleProjectLink = (link) => {
    if (!link) return;
    if (typeof link === "string") {
      window.open(link, "_blank");
      return;
    }

    if (link.type === "projects") {
      if (link.entry) {
        showProject(link.entry);
        return;
      }
      if (link.filters) {
        showProjectsForFilters(link.filters);
        return;
      }
    }

    if (link.type === "activities" && link.entry) {
      showActivityById(link.entry);
      return;
    }

    if (link.type === "skills") {
      if (link.entry) {
        showSkillById(link.entry);
        return;
      }
      const filters = link.filters || [];
      setFocusedSkillFilters({
        professional: filters.filter((f) => f !== "personal" && f !== "featured"),
        academic: [],
        personal: filters.includes("personal"),
        featured: filters.includes("featured"),
      });
      jumpTo("skills");
      return;
    }

    if (link.type === "experience") {
      if (link.entry) showCompany(link.entry);
      else jumpTo("experience");
      return;
    }

    if (link.type === "education") {
      if (link.entry) showSchool(link.entry);
      else jumpTo("education");
      return;
    }

    if (link.type === "publications") {
      if (link.entry) showPublication(link.entry);
      else jumpTo("publications");
      return;
    }
    if (link.type === "file" && link.path) {
      window.open(`res/${sources.res}/${link.path}`, "_blank", "noopener,noreferrer");
      return;
    }
  };

  // Lock page scrolling when a project or publication overlay is open.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const locked = !!selectedProjectId || !!selectedPublicationId;

    if (locked) {
      if (!prevBodyStyles.current.locked) {
        prevBodyStyles.current = {
          overflow: document.body.style.overflow || "",
          paddingRight: document.body.style.paddingRight || "",
          locked: true,
        };
      }
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      if (prevBodyStyles.current.locked) {
        document.body.style.overflow = prevBodyStyles.current.overflow || "";
        document.body.style.paddingRight = prevBodyStyles.current.paddingRight || "";
        prevBodyStyles.current = { overflow: "", paddingRight: "", locked: false };
      }
    }

    return () => {
      if (prevBodyStyles.current.locked) {
        document.body.style.overflow = prevBodyStyles.current.overflow || "";
        document.body.style.paddingRight = prevBodyStyles.current.paddingRight || "";
        prevBodyStyles.current = { overflow: "", paddingRight: "", locked: false };
      }
    };
  }, [selectedProjectId, selectedPublicationId]);

  const showActivityById = (activityId) => {
    setFocusedActivityId(activityId);
    jumpTo("activities");
  };

  const getSectionSurfaceStyle = (sectionId) => {
    const theme = getSectionTheme(sectionId);
    const activeSeparatorColor = getSectionTheme(activeSection).accentLine;
    const isActive = activeSection === sectionId;
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    const isPreviousOfActive =
      sectionIndex >= 0 && sections[sectionIndex + 1]?.id === activeSection;

    return {
      ...getSectionStyleVars(sectionId),
      backgroundColor: isActive ? theme.activeBackground : theme.baseBackground,
      borderLeftColor: isActive ? theme.accentBorder : theme.controlBorder,
      borderBottomColor: isActive || isPreviousOfActive ? activeSeparatorColor : undefined,
    };
  };

  // index of the currently active section and the active section's accent line
  const activeIndex = sections.findIndex((s) => s.id === activeSection);
  const activeAccentLine = getSectionTheme(activeSection).accentLine;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* ================= HERO (with background image) ================= */}
      <div className="relative">
        {/* Background image */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={heroBackgroundStyle}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 -z-10 bg-black/60" />


        {/* Cover */}
        <Cover
          activeSection={activeSection}
          onJump={jumpTo}
        />
      </div>

      {/* Mobile Top Bar (anchored below cover, fades in) */}
      <MobileTopBar
        activeSection={activeSection}
        onJump={jumpTo}
        visible={isPastHero}
      />

      {/* ================= MAIN LAYOUT ================= */}
      <div className="lg:grid lg:grid-cols-[260px,1fr]">
        
        {/* Sidebar */}
        <SidebarNav
          activeSection={activeSection}
          visible={isPastHero}
          onJump={jumpTo}
        />

        {/* MAIN CONTENT */}
        <main className="w-full">
            {sectionIds.has("about-me") && (
            <section id="about-me" style={getSectionSurfaceStyle("about-me")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <About
                  isActive={activeSection === "about-me"}
                  onShowProjectFilters={showProjectsForFilters}
                  onShowActivity={showActivityById}
                  onProjectLink={handleProjectLink}
                />
              </div>
            </section>
            )}

            {sectionIds.has("skills") && (
            <section id="skills" style={getSectionSurfaceStyle("skills")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Skills
                  onShowProjects={showProjectsForSkill}
                  isActive={activeSection === "skills"}
                  isPrevious={sections[activeIndex - 1]?.id === "skills"}
                  activeAccentLine={activeAccentLine}
                  focusFilters={focusedSkillFilters}
                  onClearFocusFilters={() => setFocusedSkillFilters(null)}
                  focusedSkillId={focusedSkillId}
                  onClearFocusedSkillId={() => setFocusedSkillId(null)}
                  onShowCompany={showCompany}
                  onShowSchool={showSchool}
                />
              </div>
            </section>
            )}

            {sectionIds.has("experience") && (
            <section id="experience" style={getSectionSurfaceStyle("experience")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Experience isActive={activeSection === "experience"} onShowProjects={showProjectsForCompany} onShowSkills={showSkillsForCompany} onProjectLink={handleProjectLink} focusedCompanyId={focusedCompanyId} onClearFocusedCompany={() => setFocusedCompanyId(null)} />
              </div>
            </section>
            )}

            {sectionIds.has("education") && (
            <section id="education" style={getSectionSurfaceStyle("education")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Education isActive={activeSection === "education"} onShowProjects={showProjectsForAcademic} onShowSkills={showSkillsForAcademic} onProjectLink={handleProjectLink} focusedSchoolId={focusedSchoolId} onClearFocusedSchool={() => setFocusedSchoolId(null)} />
              </div>
            </section>
            )}

            {sectionIds.has("projects") && (
            <section id="projects" style={getSectionSurfaceStyle("projects")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Projects
                  focusedSkill={focusedSkill} setFocusedSkill={setFocusedSkill}
                  focusedCompany={focusedCompany} setFocusedCompany={setFocusedCompany}
                  focusedActivity={focusedActivity} setFocusedActivity={setFocusedActivity}
                  focusedProjectFilters={focusedProjectFilters} setFocusedProjectFilters={setFocusedProjectFilters}
                  focusedAcademic={focusedAcademic} setFocusedAcademic={setFocusedAcademic}
                  isActive={activeSection === "projects"}
                  onProjectClick={showProject}
                />
              </div>
            </section>
            )}

            {sectionIds.has("publications") && (
            <section id="publications" style={getSectionSurfaceStyle("publications")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Publications isActive={activeSection === "publications"} onPublicationClick={showPublication} />
              </div>
            </section>
            )}

            {sectionIds.has("activities") && (
            <section id="activities" style={getSectionSurfaceStyle("activities")} className="px-6 lg:px-10 py-16 border-b border-gray-800 lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Activities
                  isActive={activeSection === "activities"}
                  onShowProjects={showProjectsForActivity}
                  onProjectLink={handleProjectLink}
                  focusedActivityId={focusedActivityId}
                  setFocusedActivityId={setFocusedActivityId}
                />
              </div>
            </section>
            )}

            {sectionIds.has("contact") && (
            <section id="contact" style={getSectionSurfaceStyle("contact")} className="px-6 lg:px-10 py-20 border-b lg:border-l transition-colors duration-300">
              <div className="max-w-6xl mx-auto">
                <Contact
                  isActive={activeSection === "contact"}
                  isPrevious={sections[activeIndex - 1]?.id === "contact"}
                  activeAccentLine={activeAccentLine}
                />
              </div>
            </section>
            )}
        </main>
      </div>

      {/* ── Mobile footer ── */}
      <footer className="lg:hidden relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={heroBackgroundStyle} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-gray-500 select-none">&copy; {new Date().getFullYear()} {cover.name}</p>
        </div>
      </footer>

      {/* ── Project detail page overlay ── */}
      {selectedProjectId && (
        <ProjectPage
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
          onProjectLink={handleProjectLink}
        />
      )}

      {selectedPublicationId && (
        <PublicationPage
          publicationId={selectedPublicationId}
          onBack={() => setSelectedPublicationId(null)}
          onProjectLink={handleProjectLink}
        />
      )}
    </div>
  );
}