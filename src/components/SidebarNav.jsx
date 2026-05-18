
import { useEffect, useRef, useState } from "react";
import { getSectionStyleVars, getSectionTheme, sections } from "../config/sections";
import { heroBackgroundStyle } from "../config/heroTheme";
import { cover } from "@datapack/cover";
import { sources } from "../data/sources";

export default function SidebarNav({ activeSection, visible, onJump }) {


  const navThemeVars = getSectionStyleVars(activeSection);
  const sectionBg = getSectionTheme(activeSection).activeBackground;
  const btnRefs = useRef({});
  const [stretchable, setStretchable] = useState({});
  const cvHref = `res/${sources.res}/${sources.cv}`;

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const remPx = parseFloat(rootStyles.fontSize) || 16;

    function getCurveSizePx(button) {
      const buttonStyles = getComputedStyle(button);
      const curveSizeToken = buttonStyles
        .getPropertyValue("--sidebar-active-curve-size")
        .trim();
      const curveSizeValue = parseFloat(curveSizeToken);
      const curveBasePx = Number.isNaN(curveSizeValue)
        ? remPx * 0.6
        : curveSizeToken.endsWith("rem")
          ? curveSizeValue * remPx
          : curveSizeValue;
      const borderWidthPx = parseFloat(buttonStyles.borderRightWidth) || 2;
      return curveBasePx + borderWidthPx;
    }

    function checkStretchable() {
      const updates = {};
      for (const s of sections) {
        const btn = btnRefs.current[s.id];
        const sectionEl = document.getElementById(s.id);
        if (!btn || !sectionEl) {
          updates[s.id] = { stretch: false, topClip: 0, bottomClip: 0 };
          continue;
        }
        const btnRect = btn.getBoundingClientRect();
        const sectionRect = sectionEl.getBoundingClientRect();
        const curveSize = getCurveSizePx(btn);
        updates[s.id] = {
          stretch: btnRect.top >= sectionRect.top && btnRect.bottom <= sectionRect.bottom,
          topClip: Math.max(0, Math.min(curveSize, sectionRect.top - (btnRect.top - curveSize))),
          bottomClip: Math.max(0, Math.min(curveSize, (btnRect.bottom + curveSize) - sectionRect.bottom)),
        };
      }
      setStretchable(updates);
    }
    window.addEventListener("scroll", checkStretchable, { passive: true });
    window.addEventListener("resize", checkStretchable, { passive: true });
    checkStretchable();
    return () => {
      window.removeEventListener("scroll", checkStretchable);
      window.removeEventListener("resize", checkStretchable);
    };
  }, []);

  return (
    <aside
      className={`relative hidden lg:flex flex-col items-center text-center gap-5 bg-gray-950 bg-cover bg-center bg-no-repeat p-6 transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ ...heroBackgroundStyle, ...navThemeVars, "--section-bg": sectionBg }}
    >
      {/* DARK OVERLAY for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-10 sticky top-0 flex w-full flex-col items-center gap-5 pt-6" style={{ height: "100dvh" }}>
        <img
          src={`res/${sources.res}/${cover.picture}`}
          alt={cover.name}
          className="w-20 h-20 rounded-2xl object-contain"
        />

        <div>
          <h2 className="text-lg font-semibold">{cover.name}</h2>
          <p className="text-sm text-gray-400">
            {(() => {
              const item = cover.headline_short?.[0];
              if (!item) return "";
              if (typeof item === "string") return item;
              if (item && typeof item === "object" && item.label) return item.label;
              return "";
            })()}
          </p>
        </div>

        <nav className="w-full flex flex-col gap-2 mt-4 px-2">
          {sections.map((s) => {
            const sectionVars = getSectionStyleVars(s.id);
            const isActive = activeSection === s.id;
            const shouldStretch = isActive && stretchable[s.id]?.stretch;
            const topClip = shouldStretch ? (stretchable[s.id]?.topClip ?? 0) : 0;
            const bottomClip = shouldStretch ? (stretchable[s.id]?.bottomClip ?? 0) : 0;

            if (s.id === "cv") {
              return (
                <div key="cv">
                  <div aria-hidden className="my-2 h-px w-full bg-white/10" />
                  <a
                    href={cvHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`sidebar-tab-btn text-left px-3 py-2 border text-sm transition-all duration-200 ${isActive ? "sidebar-tab-selected" : "sidebar-tab-idle"}`}
                    style={sectionVars}
                  >
                    {s.label}
                  </a>
                </div>
              );
            }

            return (
              <button
                key={s.id}
                ref={el => (btnRefs.current[s.id] = el)}
                onClick={() => onJump(s.id)}
                className={`sidebar-tab-btn text-left px-3 py-2 border text-sm transition-all duration-200 ${
                  isActive ? "sidebar-tab-selected" : "sidebar-tab-idle"
                }${shouldStretch ? " sidebar-tab-active" : ""}`}
                style={isActive ? {
                  "--curve-top-clip": `${topClip}px`,
                  "--curve-bottom-clip": `${bottomClip}px`,
                } : sectionVars}
              >
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto mb-8 text-xs text-gray-500 select-none">
          &copy; {new Date().getFullYear()} {cover.name}
        </div>
      </div>

    </aside>
  );
}