import { useRef, useEffect, useState } from "react";
import { getSectionStyleVars, sections } from "../config/sections";
import { heroBackgroundStyle } from "../config/heroTheme";
import { sources } from "../data/sources";

export default function MobileTopBar({ activeSection, onJump, visible }) {
  const buttonRefs = useRef({});
  const contentRef = useRef(null);
  const navThemeVars = getSectionStyleVars(activeSection);
  const [sectionUnderBar, setSectionUnderBar] = useState(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [showFiller, setShowFiller] = useState(false);
  const cvHref = `res/${sources.res}/${sources.cv}`;

  // measure content height so we can animate max-height and push layout down
  useEffect(() => {
    function updateHeight() {
      const el = contentRef.current;
      if (!el) return setContentHeight(0);
      setContentHeight(el.scrollHeight);
    }

    updateHeight();
    window.addEventListener("resize", updateHeight, { passive: true });
    return () => window.removeEventListener("resize", updateHeight);
  }, [activeSection]);

  useEffect(() => {
    const activeIndex = sections.findIndex(s => s.id === activeSection);
    const scrollContainer = buttonRefs.current[activeSection]?.closest('.overflow-x-auto');
    if (!scrollContainer) return;

    // Determine the neighbour buttons to ensure are visible
    const prevId = sections[activeIndex - 1]?.id;
    const nextId = sections[activeIndex + 1]?.id;

    const activeBtn = buttonRefs.current[activeSection];
    const prevBtn = prevId ? buttonRefs.current[prevId] : null;
    // Treat the CV button as the "next" neighbour when the last section is active
    let nextBtn = nextId ? buttonRefs.current[nextId] : null;
    if (!nextBtn && activeIndex === sections.length - 1) nextBtn = buttonRefs.current['cv'];

    if (!activeBtn) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const currentScroll = scrollContainer.scrollLeft;

    // Compute the target scroll: keep active button visible, but also
    // expose the prev/next neighbour when they exist.
    let left = currentScroll;
    const PADDING = 8; // a little extra breathing room

    if (nextBtn) {
      const nextRight = nextBtn.getBoundingClientRect().right - containerRect.left + currentScroll + PADDING;
      if (nextRight > currentScroll + scrollContainer.clientWidth) {
        left = nextRight - scrollContainer.clientWidth;
      }
    }

    if (prevBtn) {
      const prevLeft = prevBtn.getBoundingClientRect().left - containerRect.left + currentScroll - PADDING;
      if (prevLeft < left) {
        left = prevLeft;
      }
    }

    // Clamp
    left = Math.max(0, Math.min(left, scrollContainer.scrollWidth - scrollContainer.clientWidth));

    scrollContainer.scrollTo({ left, behavior: 'smooth' });
  }, [activeSection]);

  // Show a fixed-position filler (hero background + dark overlay) while the
  // top bar is animating into place so fast scroll doesn't expose content.
  useEffect(() => {
    let t;
    if (visible) {
      // show filler during the bar's transition
      setShowFiller(true);
      t = setTimeout(() => setShowFiller(false), 420);
    } else {
      setShowFiller(false);
    }

    return () => clearTimeout(t);
  }, [visible]);

  // track which section (if any) is currently underneath the bottom edge of the bar
  useEffect(() => {
    function updateUnderBar() {
      // when the top bar isn't visible (height 0), there's nothing under it
      if (!visible || contentHeight === 0) {
        setSectionUnderBar(null);
        return;
      }
      const bar = document.getElementById("mobile-top-bar");
      if (!bar) {
        setSectionUnderBar(null);
        return;
      }
      const bottom = bar.getBoundingClientRect().bottom;
      let found = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < bottom && rect.bottom > bottom) {
          found = s.id;
          break;
        }
      }
      setSectionUnderBar(found);
    }

    window.addEventListener("scroll", updateUnderBar, { passive: true });
    window.addEventListener("resize", updateUnderBar, { passive: true });
    updateUnderBar();
    return () => {
      window.removeEventListener("scroll", updateUnderBar);
      window.removeEventListener("resize", updateUnderBar);
    };
  }, [activeSection, visible]);

  // Choose border color: if the bar is overlaying a section and that section is NOT selected,
  // use the section's non-highlighted control border; otherwise use active accent line.
  const accentLine = navThemeVars["--section-accent-line"];
  const underBorderColor =
    sectionUnderBar && sectionUnderBar !== activeSection
      ? getSectionStyleVars(sectionUnderBar)["--section-control-border"]
      : accentLine;

  // animate max-height + opacity so the bar grows and pushes the layout down
  const wrapperStyle = {
    ...navThemeVars,
    "--mobile-topbar-border": underBorderColor,
    maxHeight: visible ? `${contentHeight}px` : "0px",
    opacity: visible ? 1 : 0,
    transition: "max-height 400ms ease, opacity 400ms ease",
    overflow: "hidden",
    pointerEvents: visible ? undefined : "none",
  };

  const fillerHeight = Math.max(48, contentHeight || 56);

  return (
    <>
      {showFiller && (
        <div
          aria-hidden
          className="lg:hidden"
          style={{
            ...heroBackgroundStyle,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: `${fillerHeight}px`,
            zIndex: 45,
            pointerEvents: "none",
            transition: "opacity 400ms ease",
            opacity: showFiller ? 1 : 0,
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "none" }} />
        </div>
      )}

      <div
        id="mobile-top-bar"
        style={wrapperStyle}
        className={`lg:hidden sticky top-0 z-50 bg-gray-950`}>
        <div ref={contentRef} className="px-2 py-2 flex gap-2 overflow-x-auto overflow-y-visible no-scrollbar">
        {sections.map((s) => {
          const sectionVars = getSectionStyleVars(s.id);
          const isActive = activeSection === s.id;
          // Only apply stretching and bottom corners removal if the top bar's outline is the selected section's highlight color
          const shouldStretch = isActive && (!sectionUnderBar || sectionUnderBar === activeSection);
          const activeLayoutBg = navThemeVars["--section-active-bg"];
          const baseActiveStyle = { width: "auto" };
          if (shouldStretch && activeLayoutBg) {
            baseActiveStyle.borderBottomColor = activeLayoutBg;
          }

          if (s.id === "cv") {
            return (
              <a
                key="cv"
                ref={el => (buttonRefs.current['cv'] = el)}
                href={cvHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`sidebar-tab-btn mobile-topbar-tab text-xs whitespace-nowrap px-3 py-2 border transition-all duration-200 ${
                  isActive
                    ? `sidebar-tab-selected${shouldStretch ? " mobile-topbar-tab-selected" : ""}`
                    : "sidebar-tab-idle"
                } shrink-0`}
                style={isActive ? baseActiveStyle : { ...sectionVars, width: "auto" }}
              >
                {s.label}
              </a>
            );
          }

          return (
            <button
              key={s.id}
              ref={el => (buttonRefs.current[s.id] = el)}
              onClick={() => onJump(s.id)}
              className={`sidebar-tab-btn mobile-topbar-tab text-xs whitespace-nowrap px-3 py-2 border transition-all duration-200 ${
                isActive
                  ? `sidebar-tab-selected${shouldStretch ? " mobile-topbar-tab-selected" : ""}`
                  : "sidebar-tab-idle"
              }`}
              style={isActive ? baseActiveStyle : { ...sectionVars, width: "auto" }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}