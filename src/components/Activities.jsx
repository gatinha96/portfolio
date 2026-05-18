import { useEffect, useMemo, useRef, useState } from "react";
import { getSectionTheme } from "../config/sections";
import { activities } from "@datapack/activities";
import { companies } from "@datapack/experience";
import { schools } from "@datapack/education";
import { projects } from "@datapack/projects";
import AnimatedCollapse from "./AnimatedCollapse";
import Icon from "./Icon";
import ShowProjectsButton from "./ShowProjectsButton";
import FilterPanel from "./FilterPanel";
import { formatRange } from "../utils/dateFormat";
import VerticalTimeline from "./VerticalTimeline";
import { groupDescriptionItems, renderGroups, renderFlatButtons } from "../utils/descriptionRenderer.jsx";

function getActivityId(activity) {
  return activity.id ?? activity.title;
}

export default function Activities({ isActive, onShowProjects, focusedActivityId, setFocusedActivityId, onProjectLink }) {
  const sectionTheme = getSectionTheme("activities");
  const single = activities.length === 1;
  const [selectedId, setSelectedId] = useState(null);
  const [volunteeringSelected, setVolunteeringSelected] = useState(false);
  const activityRefs = useRef({});

  const hasVolunteeringActivities = useMemo(() =>
    activities.some((a) => (a.tags || []).includes("volunteering")),
  []);

  const sorted = useMemo(
    () =>
      [...activities].sort((a, b) => {
        const aDate = a.roles?.[0]?.date?.start || "";
        const bDate = b.roles?.[0]?.date?.start || "";
        return bDate.localeCompare(aDate);
      }).map((activity) => ({
        ...activity,
        resolvedId: getActivityId(activity),
      })),
    []
  );

  const displayedSorted = useMemo(() =>
    volunteeringSelected
      ? sorted.filter((a) => (a.tags || []).includes("volunteering"))
      : sorted,
  [sorted, volunteeringSelected]);

  const [openId, setOpenId] = useState(single ? sorted[0]?.resolvedId ?? null : null);

  // Timeline: if single, use roles as entries; else, use activities
  const timelineEntries = useMemo(() => {
    if (single) {
      const act = displayedSorted[0];

      if (!act) {
        return [];
      }

      return act.roles.map((role, idx) => ({
        id: `${act.resolvedId}__role${idx}`,
        startDate: role.date?.start,
        endDate: role.date?.end,
      }));
    } else {
      return displayedSorted.map((act) => {
        const periods = (act.roles || []).map((r, idx) => ({
          id: `${act.resolvedId}__role${idx}`,
          startDate: r.date?.start,
          endDate: r.date?.end,
        }));

        const starts = periods.map((p) => p.startDate).filter(Boolean).sort();
        const ends = periods.map((p) => p.endDate).filter(Boolean).sort();
        const startDate = starts[0];
        const endDate = ends.length === (act.roles || []).length ? ends.at(-1) : null;

        return { id: act.resolvedId, startDate, endDate, periods };
      });
    }
  }, [single, displayedSorted]);

  useEffect(() => {
    if (!focusedActivityId) {
      return;
    }

    setOpenId(focusedActivityId);
    activityRefs.current[focusedActivityId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    setFocusedActivityId?.(null);
  }, [focusedActivityId, setFocusedActivityId]);

  const activeId = single ? selectedId : openId;

  return (
    <section id="activities" className="py-16">
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
        <div className="relative pt-4">
          <h2 className="text-3xl font-bold mb-2">Activities</h2>
          {hasVolunteeringActivities && (
            <FilterPanel
              leadingControls={[
                {
                  id: "volunteering",
                  label: "Volunteering",
                  active: volunteeringSelected,
                  onClick: () => setVolunteeringSelected((v) => !v),
                },
              ]}
              filters={[]}
              onClearAll={() => setVolunteeringSelected(false)}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 items-stretch">
        {/* Vertical timeline */}
        <VerticalTimeline entries={timelineEntries} activeId={activeId} />

        {/* Cards */}
        <div className="flex-1">

        {displayedSorted.map((act) => {
          const isEntryOpen = single || openId === act.resolvedId;
          // Count projects with this activity title as tag
          const projectCount = projects.filter(p => p.tags.includes(act.title)).length;
          return (
            <div
              key={act.resolvedId}
              ref={(element) => {
                activityRefs.current[act.resolvedId] = element;
              }}
              data-activity-id={act.resolvedId}
              className={`section-entry relative pt-8 first:pt-0 pb-6 last:pb-0 border-b border-gray-800 last:border-b-0 transition-all duration-200 rounded-r-sm ${isEntryOpen && !single ? 'open' : ''} ${single ? 'force-open' : ''}`}
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={single ? undefined : () => setOpenId(openId === act.resolvedId ? null : act.resolvedId)}
                  className={`w-full text-left flex items-center justify-between gap-4 ${single ? "cursor-default" : ""}`}
                  disabled={!!single}
                  tabIndex={single ? -1 : 0}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        {act.icon && <Icon icon={act.icon} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{act.title}</h3>
                        {/** Origins (company / school / personal / raw tags) */}
                        {act.tags && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {act.tags.map((tag) => {
                              const company = companies.find((c) => c.id === tag);
                              if (company) {
                                return (
                                  <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                    <Icon icon={company.icon} />
                                    {company.label ?? company.title}
                                  </span>
                                );
                              }

                              const school = schools.find((s) => s.id === tag);
                              if (school) {
                                const schoolLabel = school.label ?? school.title;
                                return (
                                  <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                    <Icon icon={school.icon} />
                                    {schoolLabel}
                                  </span>
                                );
                              }

                              const project = projects.find((p) => p.id === tag);
                              if (project) {
                                return (
                                  <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                    {project.icon && <Icon icon={project.icon} />}
                                    {project.label ?? project.title}
                                  </span>
                                );
                              }

                              if (tag === "personal") {
                                return (
                                  <span key={tag} className="px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                    Personal
                                  </span>
                                );
                              }

                              if (tag === "volunteering") {
                                return (
                                  <span key={tag} className="px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                    Volunteering
                                  </span>
                                );
                              }

                              // fallback: render raw tag label
                              return (
                                <span key={tag} className="px-2 py-1 text-xs rounded border whitespace-nowrap section-chip">
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-gray-400 text-sm">{single ? "−" : openId === act.resolvedId ? '−' : '+'}</span>
                </button>

              </div>

              {/* Expanded roles (sub-entries) */}
              <AnimatedCollapse open={isEntryOpen}>
                <div className="section-subentries mt-4 ml-4 pl-4 sm:ml-11">

                  {(() => {
                    const desc = Array.isArray(act.description) ? act.description.slice() : [];
                    const trailing = [];
                    while (desc.length > 0) {
                      const last = desc[desc.length - 1];
                      if (last && typeof last === 'object' && last.type === 'button') {
                        trailing.unshift(last);
                        desc.pop();
                        continue;
                      }
                      break;
                    }
                    const groups = groupDescriptionItems(desc || []);
                    const textGroups = groups.filter((g) => g.type === 'text');
                    const otherGroups = groups.filter((g) => g.type !== 'text');

                    if (textGroups.length > 0 || otherGroups.length > 0 || projectCount > 0 || trailing.length > 0) {
                      return (
                        <div className="mb-2">
                          {textGroups.length > 0 && (
                            <div className="space-y-1">
                              {renderGroups(textGroups, `activity-desc-${act.resolvedId}-text`, onProjectLink)}
                            </div>
                          )}

                          {(otherGroups.length > 0 || projectCount > 0 || trailing.length > 0) && (
                            <div className="flex items-start gap-3 flex-wrap mt-2">
                              {otherGroups.length > 0 && (
                                <div className="min-w-0">
                                  {renderGroups(otherGroups, `activity-desc-${act.resolvedId}-other`, onProjectLink, { compact: true })}
                                </div>
                              )}
                              {(projectCount > 0 || trailing.length > 0) && (
                                <div className="flex flex-wrap gap-2">
                                  {projectCount > 0 && (
                                    <ShowProjectsButton
                                      onClick={() => onShowProjects && onShowProjects(act.title)}
                                      count={projectCount}
                                    />
                                  )}
                                  {renderFlatButtons(trailing, `activity-desc-trail-${act.resolvedId}`, onProjectLink)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {act.roles.map((role, idx) => {
                    const roleId = `${act.resolvedId}__role${idx}`;
                    const selected = single && roleId === selectedId;
                    return (
                      <div
                        key={idx}
                        className={`space-y-1 ${single ? "cursor-pointer rounded transition section-soft-hover" : ""} ${selected ? "section-soft-highlight pl-2" : ""}`}
                        onClick={single ? () => setSelectedId(roleId) : undefined}
                        tabIndex={single ? 0 : -1}
                      >
                        {role.title && <h4 className="font-medium text-gray-200">{role.title}</h4>}

                        <p className="text-xs text-gray-400">
                          {formatRange(role.date)}
                        </p>

                        {Array.isArray(role.description)
                          ? renderGroups(groupDescriptionItems(role.description), `${act.resolvedId}__role${idx}`, onProjectLink)
                          : <p className="text-sm text-gray-300">{role.description}</p>
                        }
                      </div>
                    );
                  })}
                </div>
              </AnimatedCollapse>
            </div>
          );
        })}
      </div>
    </div>
    </section>
  );
}
