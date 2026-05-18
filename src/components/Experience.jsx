import { useState, useMemo, useEffect, useRef } from "react";
import { getSectionTheme } from "../config/sections";
import { companies } from "@datapack/experience";
import { projects } from "@datapack/projects";
import { skills } from "@datapack/skills";
import ExperienceCard from "./ExperienceCard";
import VerticalTimeline from "./VerticalTimeline";

export default function Experience({ isActive, onShowProjects, onShowSkills, onProjectLink, focusedCompanyId, onClearFocusedCompany }) {
  const sectionTheme = getSectionTheme("experience");
  const single = companies.length === 1;
  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(single ? companies[0].id : null);
  const entryRefs = useRef({});

  useEffect(() => {
    if (!focusedCompanyId) return;
    setOpenId(focusedCompanyId);
    setTimeout(() => {
      entryRefs.current[focusedCompanyId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
    onClearFocusedCompany?.();
  }, [focusedCompanyId]);

  // sort by most recent role start date
  const sorted = useMemo(
    () =>
      [...companies].sort((a, b) => {
        const aDate = a.roles?.[0]?.date?.start || "";
        const bDate = b.roles?.[0]?.date?.start || "";
        return bDate.localeCompare(aDate);
      }),
    []
  );

  // Timeline: if single, use roles as entries; else, use companies
  const timelineEntries = useMemo(() => {
    if (single) {
      const company = companies[0];
      return company.roles.map((role, idx) => ({
        id: `${company.id}__role${idx}`,
        startDate: role.date?.start,
        endDate: role.date?.end,
      }));
    } else {
      return sorted.map((company) => {
        const periods = (company.roles || []).map((r, idx) => ({
          id: `${company.id}__role${idx}`,
          startDate: r.date?.start,
          endDate: r.date?.end,
        }));

        const starts = periods.map((p) => p.startDate).filter(Boolean).sort();
        const ends = periods.map((p) => p.endDate).filter(Boolean).sort();
        const startDate = starts[0];
        const endDate = ends.length === (company.roles || []).length ? ends.at(-1) : null;

        return { id: company.id, startDate, endDate, periods };
      });
    }
  }, [single, sorted]);

  const skillIdSet = useMemo(() => new Set((skills || []).map((s) => s.id)), []);

  const skillCountByCompany = useMemo(() => {
    const counts = new Map();

    companies.forEach((company) => {
      const ids = new Set();

      // Direct association from skill tags.
      skills.forEach((skill) => {
        if (skill.tags?.includes(company.id)) {
          ids.add(skill.id);
        }
      });

      // Association inferred from projects.
      projects.forEach((p) => {
        if (!p.tags || !p.tags.includes(company.id)) return;
        p.tags.forEach((tag) => {
          if (skillIdSet.has(tag)) ids.add(tag);
        });
      });

      counts.set(company.id, ids.size);
    });

    return counts;
  }, [skillIdSet]);

  // For single, highlight selected role; for multi, highlight selected company
  const activeId = single ? selectedId : openId;

  return (
    <section className="py-16">
      {/* Sticky header */}
    <div
    className="sticky top-12 lg:top-0 z-40 backdrop-blur border-b mb-10 relative transition-colors duration-300"
    style={{
            backgroundColor: isActive ? 'var(--section-active-bg)' : 'var(--section-base-bg)',
            borderBottomColor: isActive ? sectionTheme.accentBorder : sectionTheme.controlBorder
        }}
    >
		<div
		  className="absolute inset-0 transition-colors duration-300"
		  style={{ backgroundColor: isActive ? sectionTheme.stickyActiveOverlay : "transparent" }}
		/>
		<div className="relative pt-4 pb-2">
		  <h2 className="text-3xl font-bold">Experience</h2>
		</div>
	  </div>

      <div className="flex gap-2 sm:gap-4 items-stretch">
        {/* Vertical timeline */}
        <VerticalTimeline entries={timelineEntries} activeId={activeId} />

        {/* Cards */}
        <div className="flex-1">
          {sorted.map((company) => {
            // Only show button if entry is open/selected (not sub-entry)
            const isEntryOpen = single || openId === company.id;
            // Count projects with this company id as tag
            const projectCount = projects.filter(p => p.tags.includes(company.id)).length;
            const skillCount = skillCountByCompany.get(company.id) || 0;
            return (
              <div
                key={company.id}
                ref={(el) => { entryRefs.current[company.id] = el; }}
                className={`section-entry scroll-mt-20 pt-8 first:pt-0 pb-6 last:pb-0 border-b border-gray-800 last:border-b-0 transition-all duration-200 rounded-r-sm ${isEntryOpen && !single ? 'open' : ''} ${single ? 'force-open' : ''}`}
              >
                <ExperienceCard
                  company={company}
                  open={isEntryOpen}
                  onToggle={single ? undefined : () => setOpenId(openId === company.id ? null : company.id)}
                  forceOpen={single}
                  roleSelectable={single}
                  selectedRoleId={selectedId}
                  onSelectRole={single ? (idx) => {
                    const roleId = `${company.id}__role${idx}`;
                    setSelectedId(selectedId === roleId ? null : roleId);
                  } : undefined}
                  showProjectsButton={isEntryOpen && projectCount > 0}
                  projectCount={projectCount}
                  showSkillsButton={isEntryOpen && skillCount > 0}
                  skillCount={skillCount}
                  onShowProjects={() => onShowProjects && onShowProjects(company.id)}
                  onShowSkills={() => onShowSkills && onShowSkills(company.id)}
                  onProjectLink={onProjectLink}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}