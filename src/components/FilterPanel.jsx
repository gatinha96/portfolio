import { useState, Fragment, useRef, useEffect, useLayoutEffect } from "react";
import AnimatedCollapse from "./AnimatedCollapse";
import FilterDropdown from "./FilterDropdown";
import FilterChips from "./FilterChips";

export default function FilterPanel({
    filters = [],
    leadingControls = [],
    personal,
    onClearAll,
    chips, // ✅ NEW (passed from parent)
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [contentVisible, setContentVisible] = useState(true);
    const drawerRef = useRef(null);
    const measureRef = useRef(null);
    const buttonRefs = useRef({});
    const prevOpenDropdownRef = useRef(null);
    const [needsStackLayout, setNeedsStackLayout] = useState(false);
    const contentFadeDuration = 180;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Keep open only if clicking inside the drawer
            if (drawerRef.current && drawerRef.current.contains(e.target)) {
                return;
            }
            // Close for everything else (including filter bar)
            setOpenDropdown(null);
        };

        if (openDropdown) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [openDropdown]);

    // When dropdown opens: scroll header into sticky position + constrain drawer height
    useEffect(() => {
        if (!openDropdown) return;

        let fallbackTimer;

        const onResize = () => {
            if (!drawerRef.current) return;
            const rect = drawerRef.current.getBoundingClientRect();
            const available = window.innerHeight - rect.top - 8;
            if (available < drawerRef.current.scrollHeight) {
                drawerRef.current.style.maxHeight = `${Math.max(available, 120)}px`;
                drawerRef.current.style.overflowY = 'auto';
            } else {
                drawerRef.current.style.maxHeight = '';
                drawerRef.current.style.overflowY = '';
            }
        };

        const frame = requestAnimationFrame(() => {
            if (!drawerRef.current) return;

            // Scroll the dropdown trigger button into view (horizontal)
            const triggerBtn = buttonRefs.current[openDropdown];
            if (triggerBtn) {
                triggerBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }

            const stickyHeader = drawerRef.current.closest('.sticky');
            const stickyTop = stickyHeader
                ? parseFloat(getComputedStyle(stickyHeader).top) || 0
                : 0;

            const applyMaxHeight = () => {
                if (!drawerRef.current) return;
                const rect = drawerRef.current.getBoundingClientRect();
                const available = window.innerHeight - rect.top - 8;
                if (available < drawerRef.current.scrollHeight) {
                    drawerRef.current.style.maxHeight = `${Math.max(available, 120)}px`;
                    drawerRef.current.style.overflowY = 'auto';
                }
            };

            if (stickyHeader) {
                const headerRect = stickyHeader.getBoundingClientRect();
                if (headerRect.top > stickyTop + 2) {
                    // Scroll page so the header reaches its sticky position
                    window.scrollBy({ top: headerRect.top - stickyTop, behavior: 'smooth' });

                    const onScrollEnd = () => applyMaxHeight();
                    window.addEventListener('scrollend', onScrollEnd, { once: true });
                    fallbackTimer = setTimeout(() => {
                        window.removeEventListener('scrollend', onScrollEnd);
                        applyMaxHeight();
                    }, 600);
                } else {
                    applyMaxHeight();
                }
            } else {
                applyMaxHeight();
            }
        });

        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(fallbackTimer);
            window.removeEventListener('resize', onResize);
        };
    }, [openDropdown, activeDropdownId]);

    useLayoutEffect(() => {
        let fadeTimeoutId;
        let animationFrameId;
        const prevOpenDropdown = prevOpenDropdownRef.current;

        if (prevOpenDropdown === openDropdown) {
            // no-op
        } else if (!prevOpenDropdown && openDropdown) {
            setActiveDropdownId(openDropdown);
            setContentVisible(true);
        } else if (prevOpenDropdown && !openDropdown) {
            setContentVisible(true);
        } else {
            setContentVisible(false);
            fadeTimeoutId = window.setTimeout(() => {
                setActiveDropdownId(openDropdown);
                animationFrameId = window.requestAnimationFrame(() => {
                    setContentVisible(true);
                });
            }, contentFadeDuration);
        }

        prevOpenDropdownRef.current = openDropdown;

        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
            if (fadeTimeoutId) {
                window.clearTimeout(fadeTimeoutId);
            }
        };
    }, [openDropdown]);

    // Check if all items (including label + Clear all) fit in one row
    useEffect(() => {
        const checkFitness = () => {
            if (!measureRef.current) return;
            const el = measureRef.current;
            setNeedsStackLayout(el.scrollWidth > el.clientWidth);
        };

        checkFitness();
        window.addEventListener("resize", checkFitness);
        const timer = setTimeout(checkFitness, 100);

        return () => {
            window.removeEventListener("resize", checkFitness);
            clearTimeout(timer);
        };
    }, [filters, personal]);

    const toggleInList = (list, value) =>
        list.includes(value)
            ? list.filter((v) => v !== value)
            : [...list, value];

    const scrollSectionToTop = () => {
        const sec = (drawerRef.current && drawerRef.current.closest && drawerRef.current.closest('section')) ||
            (measureRef.current && measureRef.current.closest && measureRef.current.closest('section'));
        if (sec) {
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderDropdownContent = (filter) => {
        if (!filter) {
            return null;
        }

        return (
            <div className={`transition-opacity duration-200 ease-in-out ${contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {filter.items && (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {filter.items.map((item) => {
                                    const displayTitle = filter.id && filter.id.includes("acad")
                                        ? (item.labels?.[0] ?? item.label ?? item.title)
                                        : item.title;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                filter.setSelected((prev) =>
                                                    toggleInList(prev, item.id)
                                                );
                                                scrollSectionToTop();
                                            }}
                                            className={`px-3 py-1.5 rounded-lg border text-sm ${filter.selected.includes(item.id)
                                                ? "section-control-active"
                                                : "section-control-idle"
                                                }`}
                                        >
                                            {displayTitle}
                                        </button>
                                    );
                                })}
                        </div>

                        <div className="mt-4 flex justify-between text-xs text-gray-400">
                            <button
                                onClick={() => {
                                    filter.setSelected(filter.items.map((i) => i.id));
                                    scrollSectionToTop();
                                }}
                            >
                                All
                            </button>
                            <button onClick={() => { filter.setSelected([]); scrollSectionToTop(); }}>
                                Clear
                            </button>
                        </div>
                    </>
                )}

                {filter.grouped && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {filter.order.map((type) => {
                                const group = filter.grouped[type];
                                if (!group) return null;

                                return (
                                    <div key={type}>
                                        <h4 className="text-gray-400 mb-2">
                                            {filter.labels[type]}
                                        </h4>

                                        <div className="flex flex-wrap gap-2">
                                            {group.map((skill) => (
                                                <button
                                                    key={skill.id}
                                                    onClick={() => {
                                                        filter.setSelected((prev) =>
                                                            toggleInList(prev, skill.id)
                                                        );
                                                        scrollSectionToTop();
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg border text-xs ${filter.selected.includes(skill.id)
                                                        ? "section-control-active"
                                                        : "section-control-idle"
                                                        }`}
                                                >
                                                    {skill.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex justify-end text-xs text-gray-400">
                            <button onClick={() => { filter.setSelected([]); scrollSectionToTop(); }}>
                                Clear
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const activeDropdownFilter = filters.find((filter) => filter.id === activeDropdownId) ?? null;
    const separatorClassName = "text-gray-500 select-none";

    return (
        <>
            {/* Hidden measurement row: always renders full single-row layout */}
            <div
                ref={measureRef}
                aria-hidden="true"
                className="flex gap-3 items-center overflow-hidden pointer-events-none"
                style={{ height: 0, visibility: 'hidden' }}
            >
                <span className="text-sm text-gray-400 mr-1 whitespace-nowrap">Filters:</span>
                {leadingControls.map((control) => (
                    <span key={control.id} className="px-3 py-1.5 text-sm whitespace-nowrap">
                        {control.label}
                    </span>
                ))}
                {leadingControls.length > 0 && filters.length > 0 && (
                    <span className={separatorClassName}>·</span>
                )}
                {filters.map((f, index) => (
                    <Fragment key={f.id}>
                        {index > 0 && filters[index - 1].group !== f.group && (
                            <span className={separatorClassName}>·</span>
                        )}
                        <span className="px-3 py-1.5 text-sm whitespace-nowrap">{f.label} ▾</span>
                        {personal && f.id.includes("acad") && (
                            <span className="px-3 py-1.5 text-sm whitespace-nowrap">Personal</span>
                        )}
                    </Fragment>
                ))}
                <span className="ml-auto text-sm whitespace-nowrap">Clear all</span>
            </div>

            {/* FILTER BAR */}
            {/* Stacked header: Filters label and Clear all - shown when buttons don't fit */}
            {needsStackLayout && (
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">Filters:</span>
                    <button
                        onClick={onClearAll}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Buttons container */}
            <div 
                className={`flex gap-3 ${openDropdown ? 'mb-2' : 'mb-4'} items-center overflow-y-visible no-scrollbar ${needsStackLayout ? 'overflow-x-auto' : ''}`}
            >
                {/* Label: shown only when everything fits in one row */}
                {!needsStackLayout && (
                    <span className="text-sm text-gray-400 mr-1">
                        Filters:
                    </span>
                )}
                {leadingControls.map((control) => (
                    <button
                        key={control.id}
                        onClick={() => {
                            control.onClick();
                            scrollSectionToTop();
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${control.active
                            ? "section-control-active"
                            : "section-control-idle"
                            }`}
                    >
                        {control.label}
                    </button>
                ))}
                {leadingControls.length > 0 && filters.length > 0 && (
                    <span className={separatorClassName}>·</span>
                )}
                {filters.map((f, index) => (
                    <Fragment key={f.id}>
                        {index > 0 && filters[index - 1].group !== f.group && (
                            <span className={separatorClassName}>·</span>
                        )}
                        <FilterDropdown
                            ref={(el) => (buttonRefs.current[f.id] = el)}
                            id={f.id}
                            label={f.label}
                            selectedCount={f.selected.length}
                            totalCount={
                                f.items
                                    ? f.items.length
                                    : Object.values(f.grouped || {}).flat().length
                            }
                            open={openDropdown}
                            setOpen={setOpenDropdown}
                        />

                        {/* 👇 works for BOTH "acad" and "skill-acad" */}
                        {personal && f.id.includes("acad") && (
                            <button
                                onClick={() => { personal.setValue((v) => !v); scrollSectionToTop(); }}
                                className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${personal.value
                                    ? "section-control-active"
                                    : "section-control-idle"
                                    }`}
                            >
                                Personal
                            </button>
                        )}
                    </Fragment>
                ))}

                {/* Clear all button: shown only when everything fits in one row */}
                {!needsStackLayout && (
                    <button
                        onClick={() => { onClearAll(); scrollSectionToTop(); }}
                        className="ml-auto text-sm text-gray-400 hover:text-white whitespace-nowrap"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* DRAWER */}
            <AnimatedCollapse open={!!openDropdown} className="mb-6">
                {activeDropdownFilter && (
                    <div
                        ref={drawerRef}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 border rounded-xl p-4 filter-drawer-scrollbar section-card-strong"
                        style={{
                            borderTopColor: 'var(--section-accent-border)',
                            borderLeftColor: 'var(--section-accent-border)',
                            borderRightColor: 'var(--section-accent-border)',
                            borderBottomColor: 'var(--section-accent-border)',
                            marginTop: 0,
                            zIndex: 10
                        }}
                    >
                        {renderDropdownContent(activeDropdownFilter)}
                    </div>
                )}
            </AnimatedCollapse>

            {/* CHIPS (now passed cleanly) */}
            {chips && <FilterChips {...chips} />}
        </>
    );
}