import { useState, useMemo, useEffect, useRef } from "react";
import { getSectionTheme } from "../config/sections";
import { schools } from "@datapack/education";
import { projects } from "@datapack/projects";
import { skills } from "@datapack/skills";
import EducationCard from "./EducationCard";
import VerticalTimeline from "./VerticalTimeline";

export default function Education({ isActive, onShowProjects, onShowSkills, onProjectLink, focusedSchoolId, onClearFocusedSchool }) {
  const sectionTheme = getSectionTheme("education");
  const single = schools.length === 1;
  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(single ? schools[0].id : null);
  const entryRefs = useRef({});

  useEffect(() => {
    if (!focusedSchoolId) return;
    setOpenId(focusedSchoolId);
    setTimeout(() => {
      entryRefs.current[focusedSchoolId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
    onClearFocusedSchool?.();
  }, [focusedSchoolId]);

  const sorted = useMemo(
    () =>
      [...schools].sort((a, b) => {
        const getStart = (s) => (s.courses || []).map(c => c.date?.start).filter(Boolean).sort().at(-1) || "";
        return getStart(b).localeCompare(getStart(a));
      }),
    []
  );

  // set for quick skill id membership checks
  const skillIdSet = useMemo(() => new Set((skills || []).map((s) => s.id)), []);

  const normalizeAssociationTag = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const schoolAssociationTagMap = useMemo(
    () =>
      new Map(
        schools.map((school) => {
          const labelTags = (school.labels || []).map(normalizeAssociationTag).filter(Boolean);
          return [school.id, new Set([school.id, ...labelTags])];
        })
      ),
    []
  );

  const skillCountBySchool = useMemo(() => {
    const counts = new Map();

    schools.forEach((school) => {
      const ids = new Set();
      const associationTags = Array.from(
        schoolAssociationTagMap.get(school.id) || new Set([school.id])
      );

      // Direct association from skill tags.
      skills.forEach((skill) => {
        if (associationTags.some((tag) => skill.tags?.includes(tag))) {
          ids.add(skill.id);
        }
      });

      // Association inferred from projects.
      projects.forEach((p) => {
        if (!p.tags || !p.tags.includes(school.id)) return;
        (p.tags || []).forEach((tag) => {
          if (skillIdSet.has(tag)) ids.add(tag);
        });
      });

      counts.set(school.id, ids.size);
    });

    return counts;
  }, [schoolAssociationTagMap, skillIdSet]);

  // Timeline: if single, use courses as entries; else, use schools
  const timelineEntries = useMemo(() => {
    if (single) {
      const school = schools[0];
      return (school.courses || []).map((course, idx) => ({
        id: `${school.id}__course${idx}`,
        startDate: course.date?.start,
        endDate: course.date?.end,
      }));
    } else {
      return sorted.map((school) => {
        const courses = school.courses || [];
        if (courses.length > 1) {
          const periods = courses.map((c, idx) => ({
            id: `${school.id}__course${idx}`,
            startDate: c.date?.start,
            endDate: c.date?.end,
          }));

          const starts = periods.map((p) => p.startDate).filter(Boolean).sort();
          const ends = periods.map((p) => p.endDate).filter(Boolean).sort();
          const startDate = starts[0];
          const endDate = ends.length === courses.length ? ends.at(-1) : null;

          return { id: school.id, startDate, endDate, periods };
        }

        const c = courses[0] || {};
        return { id: school.id, startDate: c.date?.start, endDate: c.date?.end };
      });
    }
  }, [single, sorted]);

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
		  <h2 className="text-3xl font-bold">Education</h2>
		</div>
	  </div>

      <div className="flex gap-2 sm:gap-4 items-stretch">
        {/* Vertical timeline */}
        <VerticalTimeline entries={timelineEntries} activeId={activeId} />

        {/* Cards */}
        <div className="flex-1">
          {sorted.map((school) => {
            const isEntryOpen = single || openId === school.id;
            const projectCount = projects.filter(p => p.tags.includes(school.id)).length;
            const skillCount = skillCountBySchool.get(school.id) || 0;
            return (
              <div
                key={school.id}
                ref={(el) => { entryRefs.current[school.id] = el; }}
                className={`section-entry scroll-mt-20 pt-8 first:pt-0 pb-6 last:pb-0 border-b border-gray-800 last:border-b-0 transition-all duration-200 rounded-r-sm ${isEntryOpen && !single ? 'open' : ''} ${single ? 'force-open' : ''}`}
              >
                <EducationCard
                  school={school}
                  open={isEntryOpen}
                  onToggle={single ? undefined : () => setOpenId(openId === school.id ? null : school.id)}
                  forceOpen={single}
                  degreeSelectable={single}
                  selectedCourseId={selectedId}
                  onSelectCourse={single ? (cIdx) => setSelectedId(`${school.id}__course${cIdx}`) : undefined}
                  showProjectsButton={isEntryOpen && projectCount > 0}
                  projectCount={projectCount}
                  showSkillsButton={isEntryOpen && skillCount > 0}
                  skillCount={skillCount}
                  onShowProjects={() => onShowProjects && onShowProjects(school.id)}
                  onShowSkills={() => onShowSkills && onShowSkills(school.id)}
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