import { useEffect, useState, useRef } from "react";
import { getSectionTheme, getSectionStyleVars } from "../config/sections";
import { companies } from "@datapack/experience";
import { schools } from "@datapack/education";
import { projects } from "@datapack/projects";
import { publications } from "@datapack/publications";
import { formatSingle } from "../utils/dateFormat";
import Icon from "./Icon";
import { groupDescriptionItems, renderGroups } from "../utils/descriptionRenderer.jsx";

export default function PublicationPage({ publicationId, onBack, onProjectLink }) {
  const pub = publications.find((p) => p.id === publicationId);
  const theme = getSectionTheme("publications");
  const styleVars = getSectionStyleVars("publications");

  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(() => onBack?.(), 300);
  };

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!pub) return null;

  const dateLabel = pub.date ? formatSingle(pub.date) : null;

  // Resolve origins from tags (companies, schools, projects — ignore "arcticle" and other strings)
  const origins = [];
  const normalizedTags = (pub.tags || []).flatMap((t) => String(t).split(",").map((s) => s.trim())).filter(Boolean);
  normalizedTags.forEach((tag) => {
    if (tag.toLowerCase() === "arcticle") return;

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
    const project = projects.find((p) => p.id === tag);
    if (project) {
      const originCompany = (() => {
        for (const ptag of (project.tags || [])) {
          const c = companies.find((co) => co.id === ptag);
          if (c) return { entity: c, isSchool: false };
          const s = schools.find((sc) => sc.id === ptag);
          if (s) return { entity: s, isSchool: true };
        }
        return null;
      })();
      const originIcon = originCompany?.entity.icon ?? project.icon;
      const subtitle = originCompany
        ? (originCompany.isSchool ? originCompany.entity.title : (originCompany.entity.label ?? originCompany.entity.title))
        : null;
      origins.push({
        type: "project",
        id: project.id,
        title: project.title,
        icon: originIcon,
        subtitle,
      });
    }
  });

  const descriptionGroups = groupDescriptionItems(pub.description || []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
        onClick={close}
      />
      {/* Modal */}
      <div
        className="z-[200] fixed top-0 left-0 w-full h-full flex justify-center items-center px-2"
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`relative w-full max-w-4xl rounded-xl border section-card shadow-2xl flex flex-col max-h-[calc(100vh-4rem)] overflow-hidden transform transition-all duration-300 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}`}
          style={{ ...styleVars, pointerEvents: visible ? "auto" : "none", backgroundColor: theme.baseBackground }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 backdrop-blur border-b"
            style={{ backgroundColor: theme.stickyBackground, borderBottomColor: theme.accentBorder }}
          >
            <div className="px-6 pt-3 pb-4">
              <button
                onClick={close}
                className="mb-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition section-control-idle"
              >
                ← Publications
              </button>
              <h2 className="text-2xl font-bold leading-tight">{pub.title}</h2>
              {pub.publisher && (
                <p className="text-sm text-gray-400 mt-1">{pub.publisher}</p>
              )}
            </div>
          </div>

          {/* Page body (scrollable) */}
          <div className="px-6 py-8 space-y-8 overflow-y-auto" style={{ flex: 1 }}>
            {/* Date + origins */}
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
                      else if (origin.type === "project") { close(); onProjectLink?.({ type: "projects", entry: origin.id }); }
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
                          <span className="block text-xs text-gray-500">{origin.department}</span>
                        )}
                        {origin.type === "school" && (origin.headline ?? []).length > 0 && (
                          <span className="block text-xs text-gray-500">{origin.headline.join(" \u2022 ")}</span>
                        )}
                        {origin.type === "project" && origin.subtitle && (
                          <span className="block text-xs text-gray-500">{origin.subtitle}</span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description content */}
            <div className="space-y-4">
              {renderGroups(descriptionGroups, `pub-${pub.id}`, onProjectLink)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
