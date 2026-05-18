import AnimatedCollapse from "./AnimatedCollapse";
import Icon from "./Icon";
import ShowProjectsButton from "./ShowProjectsButton";
import ShowSkillsButton from "./ShowSkillsButton";
import { formatRange } from "../utils/dateFormat";
import { groupDescriptionItems, renderGroups, renderFlatButtons } from "../utils/descriptionRenderer.jsx";

export default function EducationCard({ school, open, onToggle, forceOpen, degreeSelectable, selectedCourseId, onSelectCourse, showProjectsButton, projectCount, showSkillsButton, skillCount, onShowProjects, onShowSkills, onProjectLink }) {
    const formatDate = (d) => {
        if (!d) return "";
        if (typeof d === 'string') return d;
        return formatRange(d);
    };

    const isOpen = forceOpen ? true : open;
    const toggle = forceOpen ? undefined : onToggle;

    // Expanded: show type only; collapsed: type + headline items
    const typeLabel = school.type ?? school.labels?.[0] ?? null;
    const headlineItems = school.headline ?? school.labels?.slice(1) ?? [];
    const visibleLabels = isOpen
      ? (typeLabel ? [typeLabel] : [])
      : (typeLabel ? [typeLabel, ...headlineItems] : headlineItems);

    return (
        <div className="relative">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={toggle}
                    className={`w-full text-left flex items-center justify-between gap-4 ${forceOpen ? "cursor-default" : ""}`}
                    disabled={!!forceOpen}
                    tabIndex={forceOpen ? -1 : 0}
                >
                    <div className="flex items-center gap-3">
                        {/* ICON */}
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                            <Icon icon={school.icon} />
                        </div>
                        {/* TITLE + labels */}
                        <div>
                            <h3 className="text-lg font-semibold">
                                {school.title}
                            </h3>
                            {visibleLabels.length > 0 && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {visibleLabels.join(" · ")}
                                </p>
                            )}
                        </div>
                    </div>
                    {!forceOpen && (
                        <span className="text-gray-400 text-sm">
                            {isOpen ? "−" : "+"}
                        </span>
                    )}
                </button>
            </div>

            {/* EXPANDED CONTENT */}
            <AnimatedCollapse open={isOpen}>
                <div className="section-subentries mt-4 ml-4 pl-4 sm:ml-11">

                        {/* School-level description preview + ShowProjectsButton / trailing buttons */}
                        {(() => {
                            const desc = Array.isArray(school.description) ? school.description.slice() : [];
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
                            // Only render if there is any content or button
                            if (
                                textGroups.length > 0 ||
                                otherGroups.length > 0 ||
                                showProjectsButton ||
                                trailing.length > 0
                            ) {
                                return (
                                    <div className="mb-2">
                                        {textGroups.length > 0 && (
                                            <div className="space-y-1">
                                                {renderGroups(textGroups, `school-desc-${school.id}-text`, onProjectLink)}
                                            </div>
                                        )}

                                        {(otherGroups.length > 0 || showProjectsButton || trailing.length > 0) && (
                                            <div className="flex items-start gap-3 flex-wrap mt-2">
                                                {otherGroups.length > 0 && (
                                                    <div className="min-w-0">
                                                        {renderGroups(otherGroups, `school-desc-${school.id}-other`, onProjectLink, { compact: true })}
                                                    </div>
                                                )}
                                                {(showProjectsButton || trailing.length > 0 || showSkillsButton) && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {showProjectsButton && <ShowProjectsButton onClick={onShowProjects} count={projectCount} />}
                                                        {showSkillsButton && skillCount > 0 && onShowSkills && <ShowSkillsButton onClick={() => onShowSkills(school.id)} count={skillCount} />}
                                                        {renderFlatButtons(trailing, `school-desc-trail-${school.id}`, onProjectLink)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })()}

                    {/* COURSES (sub-entries) */}
                    {(school.courses || []).map((course, cIdx) => {
                        const courseGradePercent = course.grade?.value && course.grade?.range
                            ? Math.round((course.grade.value / course.grade.range) * 100)
                            : null;

                        const courseSelected = degreeSelectable && selectedCourseId === `${school.id}__course${cIdx}`;

                        const courseDescRaw = Array.isArray(course.description) ? course.description.slice() : [];
                        const courseTrailing = [];
                        while (courseDescRaw.length > 0) {
                            const last = courseDescRaw[courseDescRaw.length - 1];
                            if (last && typeof last === 'object' && last.type === 'button') {
                                courseTrailing.unshift(last);
                                courseDescRaw.pop();
                                continue;
                            }
                            break;
                        }
                        const courseDescGroups = groupDescriptionItems(courseDescRaw);

                        return (
                            <div
                                key={cIdx}
                                className={`space-y-1 ${degreeSelectable ? `cursor-pointer rounded transition section-soft-hover ${courseSelected ? "section-soft-highlight pl-2" : ""}` : ""}`}
                                onClick={degreeSelectable ? () => onSelectCourse(cIdx) : undefined}
                                tabIndex={degreeSelectable ? 0 : -1}
                            >
                                {/* Course title */}
                                {course.title && (
                                    <h4 className="font-medium text-gray-200">{course.title}</h4>
                                )}

                                {/* Degrees as inline text */}
                                {course.degrees && course.degrees.length > 0 && (
                                    <p className="text-sm text-gray-400">
                                        {course.degrees.join(" · ")}
                                    </p>
                                )}

                                {/* Date */}
                                {course.date && (
                                    <p className="text-xs text-gray-400">{formatDate(course.date)}</p>
                                )}

                                {/* Course description (e.g. dissertation button) */}
                                {(courseDescGroups.length > 0 || courseTrailing.length > 0) && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {courseDescGroups.length > 0 && renderGroups(courseDescGroups, `course-desc-${school.id}-${cIdx}`, onProjectLink, { compact: true })}
                                        {courseTrailing.length > 0 && renderFlatButtons(courseTrailing, `course-trail-${school.id}-${cIdx}`, onProjectLink)}
                                    </div>
                                )}

                                {/* Grade */}
                                {course.grade && (
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-300 mb-1">
                                            Grade: {" "}
                                            <span className="font-medium">
                                                {course.grade.value} / {course.grade.range}
                                            </span>
                                        </p>
                                        {courseGradePercent !== null && (
                                            <div className="relative w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full section-progress-fill rounded-full"
                                                    style={{ width: `${courseGradePercent}%` }}
                                                />
                                                {Array.from({ length: course.grade.range - 1 }, (_, i) => (
                                                    <div key={i} className="absolute inset-y-0 w-px bg-black/30" style={{ left: `${((i + 1) / course.grade.range) * 100}%` }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                </div>
            </AnimatedCollapse>
        </div>
    );
}