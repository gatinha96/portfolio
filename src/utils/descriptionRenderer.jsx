import React from "react";
import { marked } from "marked";
import Icon from "../components/Icon";
import { sources } from "../data/sources";

const ALLOWED_TAGS = new Set([
  "a", "b", "strong", "i", "em", "u", "br", "code",
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "pre", "blockquote", "hr",
]);

const TAG_CLASSES = {
  p: "text-sm text-gray-300",
  h1: "text-base font-semibold text-white",
  h2: "text-sm font-semibold text-white",
  h3: "text-sm font-medium text-gray-100",
  h4: "text-sm font-medium text-gray-200",
  h5: "text-sm font-medium text-gray-300",
  h6: "text-sm text-gray-300",
  ul: "list-disc list-outside pl-5 text-sm text-gray-300 space-y-0.5",
  ol: "list-decimal list-outside pl-5 text-sm text-gray-300 space-y-0.5",
  pre: "text-sm bg-gray-800 p-2 rounded text-gray-200 font-mono overflow-x-auto my-1",
  blockquote: "text-sm text-gray-400 border-l-2 border-gray-600 pl-3 italic",
};

function sanitizeHref(href) {
  if (typeof href !== "string") return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  return null;
}

function renderNode(node, path) {
  if (node.nodeType === window.Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== window.Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes)
    .map((child, index) => renderNode(child, `${path}-${index}`))
    .filter((child) => child !== null);

  if (!ALLOWED_TAGS.has(tag)) {
    return <React.Fragment key={path}>{children}</React.Fragment>;
  }

  if (tag === "br") {
    return <br key={path} />;
  }

  if (tag === "hr") {
    return <hr key={path} className="border-gray-700 my-1" />;
  }

  if (tag === "a") {
    const href = sanitizeHref(node.getAttribute("href"));
    if (!href) {
      return <React.Fragment key={path}>{children}</React.Fragment>;
    }

    return (
      <a
        key={path}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-gray-500 underline-offset-2 hover:text-white"
      >
        {children}
      </a>
    );
  }

  const className = TAG_CLASSES[tag];
  return React.createElement(tag, { key: path, ...(className ? { className } : {}) }, children);
}

function renderHtml(html, keyPrefix) {
  if (typeof html !== "string" || typeof window === "undefined" || !window.DOMParser) {
    return html;
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild;

  return Array.from(root.childNodes).map((node, index) => renderNode(node, `${keyPrefix}-${index}`));
}

function toHtml(text) {
  if (typeof text !== "string") return "";
  return marked.parse(text, { breaks: false });
}

function isListLine(text) {
  return typeof text === "string" && /^\s*(?:[*+-]|\d+\.)\s/.test(text);
}

function isIndentedLine(text) {
  return typeof text === "string" && /^\s+/.test(text);
}

function joinTextItems(items) {
  let result = "";
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    if (i === 0) { result = cur; continue; }
    const prev = items[i - 1];
    const sameBlock =
      (isListLine(prev) || isIndentedLine(prev)) &&
      (isListLine(cur)  || isIndentedLine(cur));
    result += (sameBlock ? "\n" : "\n\n") + cur;
  }
  return result;
}

export function getItemGroup(item) {
  if (typeof item === "string") return "text";
  if (!item || typeof item !== "object") return "text";
  if (["image", "video", "youtube", "pdf", "spotify", "bandcamp"].includes(item.type)) return "media";
  if (item.type === "button") return "button";
  return "text";
}

export function groupDescriptionItems(items = []) {
  const groups = [];
  for (const item of items) {
    if (item == null) continue;
    const type = getItemGroup(item);
    const last = groups[groups.length - 1];
    const getMediaType = (i) => (i && typeof i === "object" ? i.type : null);

    // Special rule: youtube and pdf wrappers are always in their own group
    if (type === "media" && (getMediaType(item) === "youtube" || getMediaType(item) === "pdf")) {
      groups.push({ type, items: [item] });
      continue;
    }

    // Prevent merging into a group if the last group is a youtube or pdf
    const lastIsSingleSpecial = last && last.type === "media" && last.items.length === 1 && ["youtube", "pdf"].includes(getMediaType(last.items[0]));

    const mergeIntoLast =
      last &&
      last.type === type &&
      !lastIsSingleSpecial &&
      (type !== "text" || (typeof item === "string" && last.items.every((e) => typeof e === "string"))) &&
      !(type === "media" && last.items.some((i) => getMediaType(i) !== getMediaType(item)));
    if (mergeIntoLast) {
      last.items.push(item);
    } else {
      groups.push({ type, items: [item] });
    }
  }
  return groups;
}

function JustifiedImageRow({ items, keyPrefix, opts = {} }) {
  const rowHeightClass = opts.imageHeight || "h-48";
  const [ratios, setRatios] = React.useState(() => items.map(() => 1));

  const handleLoad = React.useCallback((index, e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setRatios((prev) => {
      const next = [...prev];
      next[index] = naturalWidth / naturalHeight;
      return next;
    });
  }, []);

  return (
    <div className={`flex flex-nowrap gap-3 overflow-hidden justify-center ${rowHeightClass}`}>
      {items.map((item, index) => (
        <div
          key={`${keyPrefix}-${index}`}
          className="min-w-0 h-full overflow-hidden"
          style={{ flex: `${ratios[index]} 1 0%` }}
        >
          <img
            src={`res/${sources.res}/${item.path}`}
            alt={item.alt || ""}
            className="h-full w-full rounded-lg object-contain"
            loading="lazy"
            onLoad={(e) => handleLoad(index, e)}
          />
        </div>
      ))}
    </div>
  );
}

const GALLERY_GAP = 12; // px, matches gap-3

// Google Photos–style justified gallery.
// All image aspect ratios are preloaded via Image() before any DOM rendering,
// so the layout is stable from the first paint with no intermediate states.
function JustifiedGallery({ items, keyPrefix, opts = {} }) {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [ratios, setRatios] = React.useState(null); // null = measuring
  const targetH = opts.galleryTargetH ?? 512;

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.getBoundingClientRect().width);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Preload all image dimensions before rendering the gallery
  React.useEffect(() => {
    if (typeof window === "undefined" || !items.length) return;
    let cancelled = false;
    const measured = new Array(items.length).fill(null);
    let pending = items.length;
    const done = (i, r) => {
      measured[i] = r;
      pending--;
      if (!cancelled && pending === 0) setRatios(measured.map((v) => v ?? 1));
    };
    items.forEach((item, i) => {
      const img = new window.Image();
      img.onload = () => done(i, img.naturalWidth / img.naturalHeight);
      img.onerror = () => done(i, 1);
      img.src = `res/${sources.res}/${item.path}`;
    });
    return () => { cancelled = true; };
  }, [items]);

  const rows = React.useMemo(() => {
    if (!containerWidth || !ratios) return null;
    const maxRowH = Math.min(targetH, containerWidth * 1.05);
    const minH = Math.max(96, Math.min(maxRowH, containerWidth) * 0.3);
    const minItemW = Math.max(112, containerWidth * 0.3);
    const result = [];
    let cur = [];
    let sumR = 0;
    for (let i = 0; i < items.length; i++) {
      const test = [...cur, i];
      const testSumR = test.reduce((acc, idx) => acc + ratios[idx], 0);
      const gaps = GALLERY_GAP * (test.length - 1);
      const projectedH = (containerWidth - gaps) / testSumR;
      const tooNarrow = test.some((idx) => ratios[idx] * projectedH < minItemW);
      if ((projectedH < minH || tooNarrow) && cur.length > 0) {
        result.push([...cur]);
        cur = [i];
        sumR = ratios[i];
      } else {
        cur = test;
        sumR = testSumR;
      }
    }
    if (cur.length) result.push(cur);
    return result.map((row) => {
      const rowSumR = row.reduce((s, i) => s + ratios[i], 0);
      const gaps = GALLERY_GAP * (row.length - 1);
      const height = Math.min(maxRowH, (containerWidth - gaps) / rowSumR);
      return { indices: row, height };
    });
  }, [containerWidth, ratios, items, targetH]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-3">
      {rows === null ? (
        // While preloading: render images naturally (no forced height) so they
        // stack without any letterboxing dead space.
        items.map((item, i) => (
          <img
            key={i}
            src={`res/${sources.res}/${item.path}`}
            alt={item.alt || ""}
            className="w-auto max-w-full max-h-[512px] mx-auto block rounded-lg"
            loading="lazy"
          />
        ))
      ) : (
        rows.map((row, ri) => (
          <div key={ri} className="flex gap-3 justify-center" style={{ height: row.height }}>
            {row.indices.map((idx) => (
              <div
                key={idx}
                className="min-w-0 h-full overflow-hidden rounded-lg"
                style={{ flex: `${ratios[idx]} 1 0%` }}
              >
                <img
                  src={`res/${sources.res}/${items[idx].path}`}
                  alt={items[idx].alt || ""}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export function renderMediaItem(item, key, opts = {}) {
  const compact = !!opts.compact;
  const imageMaxH = opts.imageMaxH || (compact ? 'max-h-20' : 'max-h-[32rem]');
  const imageHeight = opts.imageHeight || null;
  if (item.type === "image") {
    const imageClassName = imageHeight
      ? `max-w-full ${imageHeight} w-auto rounded-lg object-contain`
      : `w-full rounded-lg object-contain ${imageMaxH}`;
    return (
      <img
        key={key}
        src={`res/${sources.res}/${item.path}`}
        alt={item.alt || ""}
        className={imageClassName}
        style={{ display: "block", margin: "0 auto" }}
        loading="lazy"
      />
    );
  }

  if (item.type === "video") {
    return (
      <video key={key} className="w-full rounded-lg" controls preload="metadata">
        <source src={`res/${sources.res}/${item.path}`} />
      </video>
    );
  }

  if (item.type === "youtube") {
    return (
      <iframe
        key={key}
        src={item.link}
        className="w-full aspect-video rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={`Video ${key}`}
      />
    );
  }

  if (item.type === "pdf") {
    return (
      <div key={key} className="w-full">
        <iframe
          src={`res/${sources.res}/${item.path}`}
          title={item.alt || item.path || `PDF ${key}`}
          className="w-full rounded-lg"
          style={{ height: compact ? "12rem" : "32rem" }}
        />
        <div className="mt-2 text-sm text-gray-400">
          <a href={`res/${sources.res}/${item.path}`} target="_blank" rel="noopener noreferrer" className="underline">
            Open PDF in new tab
          </a>
        </div>
      </div>
    );
  }

  if (item.type === "spotify") {
    return (
      <iframe
        key={key}
        src={item.link}
        className="w-full rounded-lg"
        style={{ height: compact ? "80px" : "152px" }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Spotify ${key}`}
      />
    );
  }

  if (item.type === "bandcamp") {
    return (
      <iframe
        key={key}
        src={item.link}
        className="w-full rounded-lg"
        style={{ height: compact ? "150px" : "241px" }}
        seamless
        loading="lazy"
        title={`Bandcamp ${key}`}
      />
    );
  }

  return null;
}

// Renders button items as a flat array (no wrapping div) — use inside your own flex container
export function renderFlatButtons(items, keyPrefix, onProjectLink) {
  return items.map((item, ii) => {
    const link = item.link;
    if (link && typeof link === "object") {
      return (
        <button
          key={`${keyPrefix}-flatbtn-${ii}`}
          type="button"
          onClick={() => onProjectLink?.(link)}
          className="w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button"
        >
          <span className="flex items-center gap-2">
            {item.icon ? (
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300">
                <Icon icon={item.icon} className="w-4 h-4" />
              </span>
            ) : null}
            <span>{item.label}</span>
          </span>
        </button>
      );
    }
    return (
      <a
        key={`${keyPrefix}-flatbtn-${ii}`}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button"
      >
        <span className="flex items-center gap-2">
          {item.icon ? (
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300">
              <Icon icon={item.icon} className="w-4 h-4" />
            </span>
          ) : null}
          <span>{item.label}</span>
        </span>
      </a>
    );
  });
}

export function renderGroups(groups, keyPrefix, onProjectLink, opts = {}) {
  return groups.map((group, gi) => {
    if (group.type === "text") {
      const key = `${keyPrefix}-text-${gi}`;
      const markdown = joinTextItems(group.items);

      return (
        <React.Fragment key={key}>
          {renderHtml(toHtml(markdown), key)}
        </React.Fragment>
      );
    }

    if (group.type === "media") {
      const compact = !!opts.compact;
      const singleRow = !!opts.mediaSingleRow;
      if (group.items.every((item) => item?.type === "image")) {
        if (singleRow) {
          return (
            <JustifiedImageRow
              key={`${keyPrefix}-media-${gi}`}
              items={group.items}
              keyPrefix={`${keyPrefix}-media-${gi}`}
              opts={opts}
            />
          );
        }
        return (
          <JustifiedGallery
            key={`${keyPrefix}-media-${gi}`}
            items={group.items}
            keyPrefix={`${keyPrefix}-media-${gi}`}
            opts={opts}
          />
        );
      }
      const containerClass = singleRow
        ? "flex flex-nowrap gap-3 overflow-hidden justify-center"
        : "flex flex-wrap gap-3 justify-center";
      const itemClass = singleRow
        ? "flex flex-1 min-w-0 items-center justify-center"
        : compact
          ? "flex-1 min-w-0 flex items-center justify-center"
          : "flex-1 min-w-52 min-h-52 flex items-center justify-center";
      return (
        <div key={`${keyPrefix}-media-${gi}`} className={containerClass}>
          {group.items.map((item, ii) => (
            <div
              key={`${keyPrefix}-media-${gi}-${ii}`}
              className={itemClass}
            >
              {renderMediaItem(item, `${keyPrefix}-${gi}-${ii}`, opts)}
            </div>
          ))}
        </div>
      );
    }

    if (group.type === "button") {
      return (
        <div key={`${keyPrefix}-button-${gi}`} className="flex flex-wrap gap-2">
          {group.items.map((item, ii) => {
            const link = item.link;

            if (link && typeof link === "object") {
              return (
                <button
                  key={`${keyPrefix}-button-${gi}-${ii}`}
                  type="button"
                  onClick={() => onProjectLink?.(link)}
                  className="w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button"
                >
                  <span className="flex items-center gap-2">
                    {item.icon ? (
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300">
                        <Icon icon={item.icon} className="w-4 h-4" />
                      </span>
                    ) : null}
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            }

            return (
              <a
                key={`${keyPrefix}-button-${gi}-${ii}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button"
              >
                <span className="flex items-center gap-2">
                  {item.icon ? (
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300">
                      <Icon icon={item.icon} className="w-4 h-4" />
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </span>
              </a>
            );
          })}
        </div>
      );
    }

    return null;
  });
}
