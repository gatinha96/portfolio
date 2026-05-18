import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { sources } from "../data/sources";
import { getSectionTheme } from "../config/sections";
import Icon from "./Icon";
import SkillCard from "./SkillCard";
import { groupDescriptionItems, renderGroups } from "../utils/descriptionRenderer.jsx";

const aboutTheme = getSectionTheme("about-me");

function getHobbyId(hobby) {
  return hobby.id ?? hobby.title;
}

function getSpotifyEmbedUrl(url) {
  const match = url?.match(/open\.spotify\.com\/track\/([^?]+)/i);

  if (!match) {
    return url;
  }

  return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator`;
}

function cssColorToHex(color, fallback = "0f172a") {
  const match = color?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

  if (!match) {
    return fallback;
  }

  return match.slice(1, 4).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("");
}

function getBandcampEmbedUrl(url) {
  const mediaMatch = url?.match(/\/(track|album)=([^/?]+)/i);

  if (!mediaMatch) {
    return url;
  }

  const [, mediaType, mediaId] = mediaMatch;
  const backgroundColor = cssColorToHex(aboutTheme.cardBackgroundStrong, "131b2c");
  const linkColor = cssColorToHex(aboutTheme.accentLine, "86b7ff");

  return `https://bandcamp.com/EmbeddedPlayer/${mediaType}=${mediaId}/size=large/bgcol=${backgroundColor}/linkcol=${linkColor}/artwork=small/transparent=true/`;
}

export default function HobbyGrid({
  hobbies = [],
  onShowProjectFilters,
  onShowActivity,
  onProjectLink,
}) {
  const [selectedHobbyId, setSelectedHobbyId] = useState(null);
  const [activeInspectorId, setActiveInspectorId] = useState(null);
  const [isActiveInspectorOpen, setIsActiveInspectorOpen] = useState(false);
  const [closingInspectorId, setClosingInspectorId] = useState(null);
  const [isClosingInspectorOpen, setIsClosingInspectorOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [rowMap, setRowMap] = useState({});
  const containerRef = useRef(null);
  const prevSelectedRef = useRef(null);
  const panelDuration = 300;
  const contentFadeDuration = 180;

  const sorted = useMemo(() => {
    if (!Array.isArray(hobbies)) {
      return [];
    }

    return [...hobbies]
      .map((hobby) => ({ ...hobby, id: getHobbyId(hobby) }))
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [hobbies]);

  const hobbyIds = useMemo(
    () => new Set(sorted.map((hobby) => hobby.id)),
    [sorted]
  );

  const selectedHobbyInGrid =
    selectedHobbyId && hobbyIds.has(selectedHobbyId) ? selectedHobbyId : null;

  useEffect(() => {
    const measureRows = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const nodes = container.querySelectorAll("[data-hobby-id]");
      const nextRowMap = {};
      let currentRowTop = null;
      let rowIndex = 0;

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (currentRowTop === null) {
          currentRowTop = rect.top;
        }
        if (Math.abs(rect.top - currentRowTop) > 5) {
          rowIndex += 1;
          currentRowTop = rect.top;
        }
        const hobbyId = node.getAttribute("data-hobby-id");
        nextRowMap[hobbyId] = rowIndex;
      });

      setRowMap(nextRowMap);
    };

    measureRows();

    const handleResize = () => {
      window.requestAnimationFrame(measureRows);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sorted]);

  useLayoutEffect(() => {
    let timeoutId;
    let fadeTimeoutId;
    let animationFrameId;
    const prevSelected = prevSelectedRef.current;
    const prevSelectedInGrid =
      prevSelected && hobbyIds.has(prevSelected) ? prevSelected : null;

    const prevRow = prevSelectedInGrid ? rowMap?.[prevSelectedInGrid] : undefined;
    const newRow = selectedHobbyInGrid ? rowMap?.[selectedHobbyInGrid] : undefined;

    if (prevSelectedInGrid === selectedHobbyInGrid) {
      // No-op when unchanged.
    } else if (!prevSelectedInGrid && selectedHobbyInGrid) {
      setClosingInspectorId(null);
      setIsClosingInspectorOpen(false);
      setContentVisible(true);
      setActiveInspectorId(selectedHobbyInGrid);
      setIsActiveInspectorOpen(false);
      animationFrameId = window.requestAnimationFrame(() => {
        setIsActiveInspectorOpen(true);
      });
    } else if (prevSelectedInGrid && !selectedHobbyInGrid) {
      setActiveInspectorId(null);
      setIsActiveInspectorOpen(false);
      setContentVisible(true);
      setClosingInspectorId(prevSelectedInGrid);
      setIsClosingInspectorOpen(true);
      animationFrameId = window.requestAnimationFrame(() => {
        setIsClosingInspectorOpen(false);
      });
      timeoutId = window.setTimeout(() => {
        setClosingInspectorId(null);
      }, panelDuration);
    } else if (prevRow !== undefined && newRow !== undefined && prevRow === newRow) {
      setClosingInspectorId(null);
      setIsClosingInspectorOpen(false);
      setActiveInspectorId(prevSelectedInGrid);
      setIsActiveInspectorOpen(true);
      setContentVisible(false);
      fadeTimeoutId = window.setTimeout(() => {
        setActiveInspectorId(selectedHobbyInGrid);
        animationFrameId = window.requestAnimationFrame(() => {
          setContentVisible(true);
        });
      }, contentFadeDuration);
    } else {
      setContentVisible(true);
      setClosingInspectorId(prevSelectedInGrid);
      setIsClosingInspectorOpen(true);
      setActiveInspectorId(selectedHobbyInGrid);
      setIsActiveInspectorOpen(false);
      animationFrameId = window.requestAnimationFrame(() => {
        setIsClosingInspectorOpen(false);
        setIsActiveInspectorOpen(true);
      });
      timeoutId = window.setTimeout(() => {
        setClosingInspectorId(null);
      }, panelDuration);
    }

    prevSelectedRef.current = selectedHobbyId;

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (fadeTimeoutId) {
        window.clearTimeout(fadeTimeoutId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [selectedHobbyId, selectedHobbyInGrid, rowMap, hobbyIds]);

  const activeRow =
    activeInspectorId && rowMap?.[activeInspectorId] !== undefined
      ? rowMap[activeInspectorId]
      : null;

  const closingRow =
    closingInspectorId && rowMap?.[closingInspectorId] !== undefined
      ? rowMap[closingInspectorId]
      : null;

  const getInspectorEdgeShape = (hobbyId) => {
    if (!hobbyId) {
      return { flattenLeft: false, flattenRight: false };
    }

    const hobbyIndex = sorted.findIndex((entry) => entry.id === hobbyId);
    const currentRow = rowMap?.[hobbyId];

    if (hobbyIndex < 0 || currentRow === undefined) {
      return { flattenLeft: false, flattenRight: false };
    }

    const previousRow =
      hobbyIndex > 0 ? rowMap?.[sorted[hobbyIndex - 1].id] : null;
    const nextRow =
      hobbyIndex < sorted.length - 1
        ? rowMap?.[sorted[hobbyIndex + 1].id]
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

  const handleDetailButtonClick = (link) => {
    if (!link) return;

    // Helper to scroll section to top like sidebar/top bar
    const scrollSectionToTop = (sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const mobileBar = document.getElementById("mobile-top-bar");
      const headerOffset = mobileBar ? mobileBar.offsetHeight : 0;
      const target = Math.max(0, absoluteTop - headerOffset);
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    if (link.type === "projects") {
      if (link.project) {
        onProjectLink?.(link);
        return;
      }
      onShowProjectFilters?.(link.filters || []);
      setTimeout(() => scrollSectionToTop("projects"), 0);
      return;
    }

    if (link.type === "activities") {
      onShowActivity?.(link.entry);
      setTimeout(() => scrollSectionToTop("activities"), 0);
      return;
    }
  };

  const renderDetail = (detail, hobby, index) => {
    if (typeof detail === "string") {
      return (
        <p key={`${hobby.id}-text-${index}`} className="text-sm text-gray-300">
          {detail}
        </p>
      );
    }

    if (!detail || typeof detail !== "object") {
      return null;
    }

    if (detail.type === "button") {
      const isDisabled =
        (detail.link?.type === "projects" && !onShowProjectFilters) ||
        (detail.link?.type === "activities" && !onShowActivity);

      return (
        <button
          key={`${hobby.id}-button-${index}`}
          type="button"
          onClick={() => handleDetailButtonClick(detail.link)}
          disabled={isDisabled}
          className="w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            {detail.icon ? (
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300">
                <Icon icon={detail.icon} className="w-4 h-4" />
              </span>
            ) : null}

            <span>{detail.label}</span>
          </span>
        </button>
      );
    }

    if (detail.type === "image") {
      return (
        <img
          key={`${hobby.id}-image-${index}`}
          src={`res/${sources.res}/${detail.path}`}
          alt={detail.alt || `${hobby.title} detail`}
          className="w-full rounded-lg object-cover"
          loading="lazy"
        />
      );
    }

    if (detail.type === "video") {
      return (
        <video
          key={`${hobby.id}-video-${index}`}
          className="w-full rounded-lg"
          controls
          preload="metadata"
        >
          <source src={`res/${sources.res}/${detail.path}`} />
        </video>
      );
    }

    if (detail.type === "spotify") {
      return (
        <iframe
          key={`${hobby.id}-spotify-${index}`}
          src={getSpotifyEmbedUrl(detail.link)}
          className="h-[152px] w-full rounded-lg"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      );
    }

    if (detail.type === "bandcamp") {
      return (
        <div
          key={`${hobby.id}-bandcamp-${index}`}
          className="overflow-hidden rounded-xl"
          style={{
            background: "linear-gradient(180deg, var(--section-soft-bg) 0%, var(--section-card-bg-strong) 100%)",
            boxShadow: "0 20px 36px -28px rgba(0, 0, 0, 0.85)",
          }}
        >
          <div
            className="overflow-hidden rounded-lg"
            style={{
              backgroundColor: "var(--section-control-bg)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              margin: 0,
              padding: 0,
            }}
          >
            <iframe
              src={getBandcampEmbedUrl(detail.link)}
              title={`${hobby.title} Bandcamp player`}
              className="block w-full rounded-lg"
              style={{ minHeight: 120, border: 0, margin: 0, padding: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const renderInspectorPanel = (
    hobbyId,
    isOpen,
    panelContentVisible,
    panelEdges = {}
  ) => {
    const hobby = sorted.find((entry) => entry.id === hobbyId);
    const { flattenLeft = false, flattenRight = false } = panelEdges;

    if (!hobby) {
      return null;
    }

    return (
      <div
        className={`col-span-full rounded-b-lg border text-sm text-gray-300 relative z-0 section-card ${
          flattenLeft ? "rounded-tl-none" : "rounded-tl-lg"
        } ${flattenRight ? "rounded-tr-none" : "rounded-tr-lg"}`}
        style={{ borderColor: isOpen ? "var(--section-accent-border)" : "transparent" }}
      >
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`space-y-4 p-5 transition-opacity duration-200 ease-in-out ${
                panelContentVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-semibold text-white">{hobby.title}</h4>
              </div>

              <div className="space-y-3">
                {renderGroups(
                  groupDescriptionItems(hobby.description || []),
                  `${hobby.id}-desc`,
                  onProjectLink,
                  { compact: true, imageMaxH: "max-h-48" }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-xl p-5 section-card" style={{ scrollMarginTop: "10rem" }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-300">Hobbies</h3>

      <div
        ref={containerRef}
        className="grid grid-cols-2 gap-3"
      >
        {sorted.map((hobby, index) => {
          const currentRow = rowMap?.[hobby.id];
          const nextHobby = sorted[index + 1];
          const nextRow = nextHobby ? rowMap?.[nextHobby.id] : null;

          const isLastInActiveRow =
            activeRow !== null &&
            currentRow === activeRow &&
            (nextRow === null || nextRow !== currentRow);

          const isLastInClosingRow =
            closingRow !== null &&
            currentRow === closingRow &&
            (nextRow === null || nextRow !== currentRow);

          const isHighlighted = selectedHobbyId === hobby.id;
          const isConnected =
            isActiveInspectorOpen &&
            activeInspectorId === hobby.id &&
            contentVisible;

          return (
            <Fragment key={hobby.id}>
              <div
                data-hobby-id={hobby.id}
                className={`min-w-0 ${isConnected ? "relative z-10" : ""}`}
              >
                <SkillCard
                  skill={hobby}
                  highlighted={isHighlighted}
                  connected={isConnected}
                  onClick={() =>
                    setSelectedHobbyId(isHighlighted ? null : hobby.id)
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