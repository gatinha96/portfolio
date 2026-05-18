import { useEffect, useRef, useState } from "react";
import React from "react";
import { getSectionStyleVars, sections } from "../config/sections";
import { heroBackgroundStyle } from "../config/heroTheme";
import { cover } from "@datapack/cover";
import { sources } from "../data/sources";
import { companies } from "@datapack/experience";
import Icon from "./Icon";

function calcProfessionalExperience() {
  const now = new Date();
  let earliestStart = null;
  for (const company of companies) {
    for (const role of company.roles ?? []) {
      if (role.tags?.includes("no-calc")) continue;
      if (role.date?.start) {
        const [year, month] = role.date.start.split("-").map(Number);
        const startDate = new Date(year, month - 1, 1);
        if (!earliestStart || startDate < earliestStart) earliestStart = startDate;
      }
    }
  }
  if (!earliestStart) return null;
  const totalMonths =
    (now.getFullYear() - earliestStart.getFullYear()) * 12 +
    (now.getMonth() - earliestStart.getMonth());
  if (totalMonths < 12) return { stat: `+${totalMonths} months`, label: "of professional experience" };
  if (totalMonths < 60) return { stat: `+${(totalMonths / 12).toFixed(1)} years`, label: "of professional experience" };
  return { stat: `+${Math.floor(totalMonths / 12)} years`, label: "of professional experience" };
}

function renderHeadlineItem(item, idx, onJump) {
  if (typeof item === "string") return <span key={idx}>{item}</span>;
  if (React.isValidElement(item)) return <span key={idx}>{item}</span>;
  if (item && typeof item === "object" && item.type === "button") {
    const link = item.link;
    if (link && typeof link === "object") {
      const target = link.type;
      return (
        <button
          key={idx}
          type="button"
          onClick={() => {
            if (target === "experience" || target === "education" || target === "projects" || target === "activities" || target === "skills") {
              onJump(target);
            }
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded border text-sm section-control-idle"
        >
          {item.icon && <Icon icon={item.icon} className="w-4 h-4" />}
          {item.label}
        </button>
      );
    }
    if (typeof link === "string") {
      return (
        <a
          key={idx}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 rounded border text-sm section-control-idle"
        >
          {item.icon && <Icon icon={item.icon} className="w-4 h-4" />}
          {item.label}
        </a>
      );
    }
  }
  return null;
}

export default function Cover({ activeSection, onJump }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const [contentOffset, setContentOffset] = useState(0);
  const navThemeVars = getSectionStyleVars(activeSection);
  const cvHref = `res/${sources.res}/${sources.cv}`;

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      const content = contentRef.current;
      if (!el || !content) return;
      const rect = el.getBoundingClientRect();

      if (rect.top >= 0) {
        setContentOffset(0);
        return;
      }

      const scrolled = -rect.top;
      const sectionH = el.offsetHeight;
      const contentH = content.offsetHeight;
      const bottomMargin = 48; // px gap before wrapper bottom
      // Ideal: center content in the visible portion
      const idealOffset = scrolled / 2;
      // Max: content bottom touches section bottom minus margin
      const maxOffset = sectionH - contentH - (sectionH - contentH) / 2 - bottomMargin;
      // (sectionH - contentH) / 2 is the initial top gap from flex centering

      setContentOffset(Math.min(idealOffset, Math.max(0, maxOffset)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="start"
      style={{ ...navThemeVars, minHeight: "100dvh" }}
      className="relative min-h-screen grid place-items-center px-6 overflow-hidden"
    >
      {/* BACKGROUND IMAGE (fixed) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={heroBackgroundStyle}
      />

      {/* DARK OVERLAY for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* CONTENT */}
      <div
        className="relative z-10 w-full max-w-5xl h-full flex items-center justify-center text-center px-6"
        style={{ transform: `translateY(${contentOffset}px)` }}
      >
        <div ref={contentRef} className="w-full">
          <div className="flex justify-center mb-6">
            <img
              src={`res/${sources.res}/${cover.picture}`}
              alt={cover.name}
              className="w-40 h-40 sm:w-52 sm:h-52 rounded-3xl object-contain shadow-2xl"
            />
          </div>

          <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">
            Portfolio / CV
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            {cover.name}
          </h1>

          <div className="mt-4 text-base text-gray-300 flex flex-col items-center gap-1">
            {(cover.headline_short
              ? [
                  ...cover.headline_short.map((item, idx) => (
                    <div key={`short-${idx}`} className="sm:hidden">
                      {renderHeadlineItem(item, idx, onJump)}
                    </div>
                  )),
                  ...cover.headline_long.map((item, idx) => (
                    <div key={`long-${idx}`} className="hidden sm:block">
                      {renderHeadlineItem(item, idx, onJump)}
                    </div>
                  )),
                ]
              : cover.headline_long.map((item, idx) => (
                  <div key={idx}>
                    {renderHeadlineItem(item, idx, onJump)}
                  </div>
                ))
            )}
          </div>

          {calcProfessionalExperience() && (() => {
            const { stat, label } = calcProfessionalExperience();
            return (
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-0.5">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {stat}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {label}
                </span>
              </div>
            );
          })()}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sections
              .filter((s) => s.id !== "start")
              .map((s) => {
                const sectionVars = getSectionStyleVars(s.id);
                if (s.id === "cv") {
                  return (
                    <React.Fragment key="cv">
                      <div aria-hidden className="h-8 w-px self-center bg-white/10" />
                      <a
                        href={cvHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg border text-sm section-control-idle"
                        style={sectionVars}
                      >
                        {s.label}
                      </a>
                    </React.Fragment>
                  );
                }

                return (
                  <button
                    key={s.id}
                    onClick={() => onJump(s.id)}
                    className="px-4 py-2 rounded-lg border text-sm section-control-idle"
                    style={sectionVars}
                  >
                    {s.label}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* SEPARATOR */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800" />

      {/* Sentinel: triggers nav bars when only margin is visible */}
      <div id="cover-content-sentinel" className="absolute bottom-12 left-0 right-0 h-px pointer-events-none" />
    </section>
  );
}