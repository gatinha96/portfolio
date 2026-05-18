import { Fragment, useLayoutEffect, useMemo, useState, useRef } from "react";
import SkillCard from "./SkillCard";
import Icon from "./Icon";

export default function SkillContainer({
    type,
    label,
    skills = [],
    rowMap = {},
    containerRef, // 👈 add this
    selectedSkillId,
    setSelectedSkillId,
    getUsage,
    onShowProjects,
    onCompanyClick,
    onSchoolClick,
    onPersonalClick,
}) {
    const [activeInspectorId, setActiveInspectorId] = useState(null);
    const [isActiveInspectorOpen, setIsActiveInspectorOpen] = useState(false);
    const [closingInspectorId, setClosingInspectorId] = useState(null);
    const [isClosingInspectorOpen, setIsClosingInspectorOpen] = useState(false);
    const [contentVisible, setContentVisible] = useState(true);
    const panelDuration = 300;
    const contentFadeDuration = 180;

    // ✅ SAFETY: ensure stable sorted array
    const sorted = useMemo(() => {
        if (!Array.isArray(skills)) return [];

        return [...skills].sort((a, b) =>
            (a.title || "").localeCompare(b.title || "")
        );
    }, [skills]);

    const skillIds = useMemo(
        () => new Set(sorted.map((skill) => skill.id)),
        [sorted]
    );

    const selectedSkillInCategory =
        selectedSkillId && skillIds.has(selectedSkillId)
            ? selectedSkillId
            : null;

    const prevSelectedRef = useRef(null);

    useLayoutEffect(() => {
        let timeoutId;
        let fadeTimeoutId;
        let animationFrameId;
        const prevSelected = prevSelectedRef.current;
        const prevSelectedInCategory =
            prevSelected && skillIds.has(prevSelected)
                ? prevSelected
                : null;

        const prevRow = prevSelectedInCategory ? rowMap?.[prevSelectedInCategory] : undefined;
        const newRow = selectedSkillInCategory ? rowMap?.[selectedSkillInCategory] : undefined;

        // No-op when unchanged
        if (prevSelectedInCategory === selectedSkillInCategory) {
            // nothing
        } else if (!prevSelectedInCategory && selectedSkillInCategory) {
            // opening from closed: mount new inspector and open
            setClosingInspectorId(null);
            setIsClosingInspectorOpen(false);
            setContentVisible(true);
            setActiveInspectorId(selectedSkillInCategory);
            setIsActiveInspectorOpen(false);
            animationFrameId = window.requestAnimationFrame(() => {
                setIsActiveInspectorOpen(true);
            });
        } else if (prevSelectedInCategory && !selectedSkillInCategory) {
            // closing to none: collapse the previous panel in place
            setActiveInspectorId(null);
            setIsActiveInspectorOpen(false);
            setContentVisible(true);
            setClosingInspectorId(prevSelectedInCategory);
            setIsClosingInspectorOpen(true);
            animationFrameId = window.requestAnimationFrame(() => {
                setIsClosingInspectorOpen(false);
            });
            timeoutId = window.setTimeout(() => {
                setClosingInspectorId(null);
            }, panelDuration);
        } else {
            // switching between two skills:
            if (prevRow !== undefined && newRow !== undefined && prevRow === newRow) {
                // same visual row → keep inspector open, fade content between items
                setClosingInspectorId(null);
                setIsClosingInspectorOpen(false);
                setActiveInspectorId(prevSelectedInCategory);
                setIsActiveInspectorOpen(true);
                setContentVisible(false);
                fadeTimeoutId = window.setTimeout(() => {
                    setActiveInspectorId(selectedSkillInCategory);
                    animationFrameId = window.requestAnimationFrame(() => {
                        setContentVisible(true);
                    });
                }, contentFadeDuration);
            } else {
                // different row/category → close previous while opening the new one
                setContentVisible(true);
                setClosingInspectorId(prevSelectedInCategory);
                setIsClosingInspectorOpen(true);
                setActiveInspectorId(selectedSkillInCategory);
                setIsActiveInspectorOpen(false);
                animationFrameId = window.requestAnimationFrame(() => {
                    setIsClosingInspectorOpen(false);
                    setIsActiveInspectorOpen(true);
                });
                timeoutId = window.setTimeout(() => {
                    setClosingInspectorId(null);
                }, panelDuration);
            }
        }

        prevSelectedRef.current = selectedSkillId;

        return () => {
            if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
            if (fadeTimeoutId) window.clearTimeout(fadeTimeoutId);
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [selectedSkillId, selectedSkillInCategory, rowMap, skillIds]);

    const activeRow =
        activeInspectorId && rowMap?.[activeInspectorId] !== undefined
            ? rowMap[activeInspectorId]
            : null;

    const closingRow =
        closingInspectorId && rowMap?.[closingInspectorId] !== undefined
            ? rowMap[closingInspectorId]
            : null;

    const getInspectorEdgeShape = (skillId) => {
        if (!skillId) {
            return { flattenLeft: false, flattenRight: false };
        }

        const skillIndex = sorted.findIndex((entry) => entry.id === skillId);
        const currentRow = rowMap?.[skillId];

        if (skillIndex < 0 || currentRow === undefined) {
            return { flattenLeft: false, flattenRight: false };
        }

        const previousRow =
            skillIndex > 0 ? rowMap?.[sorted[skillIndex - 1].id] : null;
        const nextRow =
            skillIndex < sorted.length - 1
                ? rowMap?.[sorted[skillIndex + 1].id]
                : null;

        const isLastInRow = nextRow === null || nextRow !== currentRow;

        // Only flatten the right corner if the selected card is actually at the
        // visual right edge of the grid. This is only true when the row is "full"
        // (i.e. it has as many items as the maximum column count). An incomplete
        // last row ends before the grid's right edge, so the corner should stay
        // rounded.
        let flattenRight = false;
        if (isLastInRow) {
            const rowCounts = {};
            Object.values(rowMap || {}).forEach((row) => {
                rowCounts[row] = (rowCounts[row] || 0) + 1;
            });
            const maxRowCols =
                Object.values(rowCounts).length > 0
                    ? Math.max(...Object.values(rowCounts))
                    : 0;
            flattenRight = (rowCounts[currentRow] || 0) === maxRowCols;
        }

        return {
            flattenLeft: previousRow === null || previousRow !== currentRow,
            flattenRight,
        };
    };

    const activeInspectorEdges = getInspectorEdgeShape(activeInspectorId);
    const closingInspectorEdges = getInspectorEdgeShape(closingInspectorId);

    const renderInspectorPanel = (
        skillId,
        isOpen,
        panelContentVisible,
        panelEdges = {}
    ) => {
        const usage = getUsage(skillId);
        const selectedSkill = sorted.find((skill) => skill.id === skillId);
        const { flattenLeft = false, flattenRight = false } = panelEdges;

        if (!usage || !selectedSkill) return null;

        return (
            <div
                className={`col-span-full border rounded-b-lg text-sm text-gray-300 relative z-0 section-card ${
                    flattenLeft ? "rounded-tl-none" : "rounded-tl-lg"
                } ${flattenRight ? "rounded-tr-none" : "rounded-tr-lg"}`}
                style={{ borderColor: isOpen ? 'var(--section-accent-border)' : 'transparent' }}
            >
                <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className={`p-5 transition-opacity duration-200 ease-in-out ${panelContentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <h4 className="text-sm font-semibold mb-2 text-white">
                                {selectedSkill.title}
                            </h4>

                            <div className="flex flex-wrap gap-2 text-xs mb-4 text-gray-300">
                                {usage.professional?.map((company) => (
                                    <button
                                        key={company.id}
                                        type="button"
                                        onClick={() => onCompanyClick?.(company)}
                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        {company.icon && <Icon icon={company.icon} />}
                                        {company.title}
                                    </button>
                                ))}

                                {usage.academic?.map((school) => {
                                    const labelText = school.labels?.[0] ?? school.label ?? school.title;
                                    return (
                                        <button
                                            key={school.id}
                                            type="button"
                                            onClick={() => onSchoolClick?.(school)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {school.icon && <Icon icon={school.icon} />}
                                            {labelText}
                                        </button>
                                    );
                                })}

                                {usage.personal?.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => onPersonalClick?.()}
                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded border whitespace-nowrap section-chip cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        Personal
                                    </button>
                                )}
                            </div>

                            {usage.relatedProjects.length > 0 && (
                                <button
                                    onClick={() => onShowProjects(skillId)}
                                    className="px-3 py-1.5 text-xs rounded border section-accent-button"
                                >
                                    Show {usage.relatedProjects.length}{" "}
                                    {usage.relatedProjects.length === 1
                                        ? "project"
                                        : "projects"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="border rounded-xl p-5 section-card"
            style={{ scrollMarginTop: '10rem' }}
        >
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
                {label}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {sorted.map((skill, index) => {
                    const currentRow = rowMap?.[skill.id];
                    const nextSkill = sorted[index + 1];
                    const nextRow = nextSkill ? rowMap?.[nextSkill.id] : null;

                    const isLastInActiveRow =
                        activeRow !== null &&
                        currentRow === activeRow &&
                        (nextRow === null || nextRow !== currentRow);

                    const isLastInClosingRow =
                        closingRow !== null &&
                        currentRow === closingRow &&
                        (nextRow === null || nextRow !== currentRow);

                    const isHighlighted = selectedSkillId === skill.id;
                    const isConnected =
                        isActiveInspectorOpen &&
                        activeInspectorId === skill.id &&
                        contentVisible;

                    return (
                        <Fragment key={skill.id}>
                            <div data-skill-id={skill.id} className={`min-w-0 ${isConnected ? 'relative z-10' : ''}`}>
                                <SkillCard
                                    skill={skill}
                                    highlighted={isHighlighted}
                                    connected={isConnected}
                                    onClick={() =>
                                        setSelectedSkillId(
                                            isHighlighted ? null : skill.id
                                        )
                                    }
                                />
                            </div>

                            {isLastInClosingRow && closingInspectorId &&
                                renderInspectorPanel(
                                    closingInspectorId,
                                    isClosingInspectorOpen,
                                    true,
                                    closingInspectorEdges
                                )}

                            {isLastInActiveRow && activeInspectorId &&
                                renderInspectorPanel(
                                    activeInspectorId,
                                    isActiveInspectorOpen,
                                    contentVisible,
                                    activeInspectorEdges
                                )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}