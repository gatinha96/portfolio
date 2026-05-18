import { useEffect, useState, useRef } from "react";
import { getSectionTheme, getSectionStyleVars } from "../config/sections";
import { companies } from "@datapack/experience";
import { schools } from "@datapack/education";
import { skills, categories, getSkillCategoryId } from "@datapack/skills";
import { projects } from "@datapack/projects";
import { publications } from "@datapack/publications";
import { formatRange } from "../utils/dateFormat";
import Icon from "./Icon";
import ProjectStatusBadge, { getProjectBadgeTypes, getProjectPageBadgePadding } from "./ProjectStatusBadge";
import { groupDescriptionItems, renderGroups } from "../utils/descriptionRenderer.jsx";
import { getRelatedPublicationsForProject } from "../utils/projectPublications";

const skillOrder = categories.map((c) => c.id);
const skillLabels = Object.fromEntries(categories.map((c) => [c.id, c.title]));


function monthIndex(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split(/[-\/]/).map((p) => Number(p));
  const year = parts[0] || 0;
  const month = parts[1] || 1;
  return year * 12 + month;
}

function rangesOverlap(a, b) {
  if (!a || !a.start || !b || !b.start) return false;
  const aStart = monthIndex(a.start);
  const aEnd = a.end ? monthIndex(a.end) : 999999;
  const bStart = monthIndex(b.start);
  const bEnd = b.end ? monthIndex(b.end) : 999999;
  return !(aEnd < bStart || bEnd < aStart);
}


// description rendering utilities are provided by ../utils/descriptionRenderer

export default function ProjectPage({ projectId, onBack, onProjectLink }) {
  const project = projects.find((p) => p.id === projectId);
  const theme = getSectionTheme("projects");
  const styleVars = getSectionStyleVars("projects");

  // Visibility/animation state
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  // Play entrance animation on mount
  useEffect(() => {
    // next frame -> trigger CSS transition
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    // wait for animation to finish before notifying parent
    setTimeout(() => {
      onBack?.();
    }, 300);
  };

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!project) return null;

  const rawDateLabel = formatRange(project.date)?.replace("— Present", "— Ongoing");
  const dateLabel = rawDateLabel
    ? (project.tags.includes("suspended") ? `${rawDateLabel} — Suspended` : rawDateLabel)
    : null;

  // Resolve origins (company / school / personal)
  const origins = [];
  project.tags.forEach((tag) => {
    const company = companies.find((c) => c.id === tag);
    if (company) {
      origins.push({ ...company, type: "company" });
      return;
    }
    const school = schools.find((s) => s.id === tag);
    if (school) {
      origins.push({ ...school, type: "school" });
      return;
    }
    if (tag === "personal") {
      origins.push({ type: "personal", id: "personal", title: "Personal Project" });
    }
  });

  // Skills grouped by category
  const projectSkills = project.tags
    .map((tag) => skills.find((s) => s.id === tag))
    .filter(Boolean);

  const skillGroups = skillOrder
    .map((type) => ({
      type,
      label: skillLabels[type],
      items: projectSkills
        .filter((s) => getSkillCategoryId(s) === type)
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .filter((g) => g.items.length > 0);

  // Publications linked to this project (tags may be "type, projectId" comma-concatenated)
  const relatedPublications = getRelatedPublicationsForProject(project.id, publications);

  const descriptionGroups = groupDescriptionItems(project.description || []);
  const badgeTypes = getProjectBadgeTypes(project, relatedPublications.length > 0);
  const titlePaddingRight = getProjectPageBadgePadding(badgeTypes.length);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
        onClick={close}
      />
      {/* Modal */}
      <div
        className="z-[200] fixed top-0 left-0 w-full h-full flex justify-center items-center px-2"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`relative w-full max-w-4xl rounded-xl border section-card shadow-2xl flex flex-col max-h-[calc(100vh-4rem)] overflow-hidden transform transition-all duration-300 ease-out ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'}`}
          style={{ ...styleVars, pointerEvents: visible ? 'auto' : 'none', backgroundColor: theme.baseBackground }}
          onClick={(event) => event.stopPropagation()}
        >
          <ProjectStatusBadge badges={badgeTypes} variant="page" />

          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 backdrop-blur border-b"
            style={{
              backgroundColor: theme.stickyBackground,
              borderBottomColor: theme.accentBorder,
            }}
          >
            <div className="px-6 pt-3 pb-4">
              <button
                onClick={close}
                className="mb-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition section-control-idle"
              >
                ← Projects
              </button>
              <h2 className="text-2xl font-bold leading-tight" style={titlePaddingRight ? { paddingRight: titlePaddingRight } : undefined}>{project.title}</h2>
              {(project.year || project.subject) && (
                <p className="text-sm text-gray-400 mt-1">
                  {[project.year, project.subject].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          {/* Page body (scrollable) */}
          <div className="px-6 py-8 space-y-8 overflow-y-auto" style={{flex: 1}}>
            {/* Date + origin */}
            <div className="space-y-3">
              {dateLabel && (
                <p className="text-sm text-gray-400">{dateLabel}</p>
              )}

              {origins.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {origins.map((origin) => {
                    const handleOriginClick = () => {
                      if (origin.type === "company") { close(); onProjectLink?.({ type: "experience", entry: origin.id }); }
                      else if (origin.type === "school") { close(); onProjectLink?.({ type: "education", entry: origin.id }); }
                      else if (origin.type === "personal") { close(); onProjectLink?.({ type: "projects", filters: ["personal"] }); }
                    };
                    return (
                    <div
                      key={origin.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded border section-card cursor-pointer transition-opacity hover:opacity-80"
                      onClick={handleOriginClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOriginClick(); }}
                    >
                      {origin.icon && (
                        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                          <Icon icon={origin.icon} className="w-5 h-5" />
                        </span>
                      )}
                      <div className="leading-tight">
                        <span className="font-medium text-white">{origin.title}</span>
                        {origin.type === "company" && origin.department && (
                          <span className="block text-xs text-gray-500">
                            {origin.department}
                          </span>
                        )}
                        {origin.type === "school" && (origin.headline ?? origin.labels?.slice(1))?.length > 0 && (
                          <span className="block text-xs text-gray-500">
                            {(origin.headline ?? origin.labels?.slice(1)).join(" \u2022 ")}
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grade */}
            {project.grade && (() => {
              const gradePercent =
                project.grade.value && project.grade.range
                  ? Math.round((project.grade.value / project.grade.range) * 100)
                  : null;
              return (
                <div>
                  <p className="text-sm text-gray-300 mb-1">
                    Grade:{" "}
                    <span className="font-medium">
                      {project.grade.value} / {project.grade.range}
                    </span>
                  </p>
                  {gradePercent !== null && (
                    <div className="relative w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full section-progress-fill rounded-full"
                        style={{ width: `${gradePercent}%` }}
                      />
                      {Array.from({ length: project.grade.range - 1 }, (_, i) => (
                        <div key={i} className="absolute inset-y-0 w-px bg-black/30" style={{ left: `${((i + 1) / project.grade.range) * 100}%` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Description content */}
            <div className="space-y-4">
              {renderGroups(descriptionGroups, `proj-${project.id}`, onProjectLink)}
            </div>

            {/* Skills by category */}
            {skillGroups.length > 0 && (
              <div
                className="space-y-4 border-t pt-6"
                style={{ borderColor: theme.cardBorder }}
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Skills
                </h3>
                {skillGroups.map((group) => (
                  <div key={group.type}>
                    <h4 className="text-xs text-gray-500 mb-2">{group.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((skill) => (
                        <span
                          key={skill.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip cursor-pointer transition-opacity hover:opacity-80"
                          onClick={() => { close(); onProjectLink?.({ type: "skills", entry: skill.id }); }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { close(); onProjectLink?.({ type: "skills", entry: skill.id }); } }}
                        >
                          {skill.icon && <Icon icon={skill.icon} />}
                          {skill.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Publications */}
            {relatedPublications.length > 0 && (
              <div
                className="space-y-3 border-t pt-6"
                style={{ borderColor: theme.cardBorder }}
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Publications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedPublications.map((pub) => (
                    <button
                      key={pub.id}
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded border section-card cursor-pointer transition-opacity hover:opacity-80 text-left"
                      onClick={() => { close(); onProjectLink?.({ type: "publications", entry: pub.id }); }}
                    >
                      <div className="leading-tight">
                        <span className="font-medium text-white">{pub.title}</span>
                        {pub.publisher && (
                          <span className="block text-xs text-gray-500">{pub.publisher}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
