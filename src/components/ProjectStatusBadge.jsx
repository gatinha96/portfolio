import { IoDocumentText, IoRibbon, IoStar } from "react-icons/io5";

const BADGE_ICON_BY_TYPE = {
  featured: IoStar,
  certified: IoRibbon,
  publications: IoDocumentText,
};

const SINGLE_SIZE_PX = {
  card: 56,
  page: 80,
};

const MULTI_CARD_EXTRA_HEIGHT_PX = 24;
const MULTI_PAGE_EXTRA_WIDTH_PX = 48;

const ICON_SIZE_PX = {
  card: 16,
  page: 24,
};

const ICON_OFFSET_PX = {
  card: 8,
  page: 12,
};

const ICON_GAP_PX = {
  card: 8,
  page: 12,
};

const TRIANGLE_FILL_PROPS = {
  fill: "var(--section-soft-bg)",
  fillOpacity: "0.38",
};

const BORDER_PROPS = {
  stroke: "var(--section-card-border)",
  strokeWidth: "1",
  strokeLinecap: "round",
  vectorEffect: "non-scaling-stroke",
};

export function getProjectBadgeTypes(project, hasAssociatedPublications = false) {
  const badgeTypes = [];

  if (project?.tags?.includes("featured")) {
    badgeTypes.push("featured");
  }

  if (project?.tags?.includes("certified")) {
    badgeTypes.push("certified");
  }

  if (hasAssociatedPublications) {
    badgeTypes.push("publications");
  }

  return badgeTypes;
}

export function getProjectCardBadgeWrapStyle(badgeCount) {
  if (badgeCount <= 0) {
    return null;
  }

  if (badgeCount === 1) {
    return {
      float: "right",
      width: "2.5rem",
      height: "2.5rem",
      shapeOutside: "polygon(100% 0%, 100% 100%, 0% 0%)",
    };
  }

  const wrapWidthPx = SINGLE_SIZE_PX.card - 16;
  const wrapHeightPx = wrapWidthPx + MULTI_CARD_EXTRA_HEIGHT_PX * (badgeCount - 1);
  const diagonalStartPercent = ((wrapHeightPx - wrapWidthPx) / wrapHeightPx) * 100;

  return {
    float: "right",
    width: `${wrapWidthPx}px`,
    height: `${wrapHeightPx}px`,
    shapeOutside: `polygon(0% 0%, 100% 0%, 100% 100%, 0% ${diagonalStartPercent}%)`,
  };
}

export function getProjectPageBadgePadding(badgeCount) {
  if (badgeCount <= 1) {
    return undefined;
  }

  const badgeWidthPx = SINGLE_SIZE_PX.page + MULTI_PAGE_EXTRA_WIDTH_PX * (badgeCount - 1);
  return `${badgeWidthPx - 16}px`;
}

export default function ProjectStatusBadge({ badges = [], variant = "card", className = "", iconColor = "var(--section-accent-line)" }) {
  const badgeTypes = badges.filter((badge) => BADGE_ICON_BY_TYPE[badge]);

  if (badgeTypes.length === 0) {
    return null;
  }

  const isCard = variant === "card";
  const wrapperClassName = `${isCard ? "absolute top-0 right-0 pointer-events-none overflow-hidden rounded-tr-lg" : "absolute top-0 right-0 z-20 pointer-events-none overflow-hidden rounded-tr-xl"} ${className}`.trim();
  const iconStyle = { color: iconColor };

  if (badgeTypes.length === 1) {
    const BadgeIcon = BADGE_ICON_BY_TYPE[badgeTypes[0]];
    const sizePx = SINGLE_SIZE_PX[variant];
    const iconSizePx = ICON_SIZE_PX[variant];
    const iconOffsetPx = ICON_OFFSET_PX[variant];

    return (
      <div className={wrapperClassName} style={{ width: sizePx, height: sizePx }} aria-hidden="true">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <polygon points="0,0 100,100 100,0" {...TRIANGLE_FILL_PROPS} />
          <line x1="1" y1="1" x2="99" y2="99" {...BORDER_PROPS} />
        </svg>
        <BadgeIcon className="absolute" style={{ top: iconOffsetPx, right: iconOffsetPx, width: iconSizePx, height: iconSizePx, ...iconStyle }} />
      </div>
    );
  }

  if (isCard) {
    const widthPx = SINGLE_SIZE_PX.card;
    const heightPx = widthPx + MULTI_CARD_EXTRA_HEIGHT_PX * (badgeTypes.length - 1);
    const viewHeight = (heightPx / widthPx) * 100;
    const diagonalStartY = viewHeight - 100;

    return (
      <div className={wrapperClassName} style={{ width: widthPx, height: heightPx }} aria-hidden="true">
        <svg viewBox={`0 0 100 ${viewHeight}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <polygon points={`0,0 100,0 100,${viewHeight} 0,${diagonalStartY}`} {...TRIANGLE_FILL_PROPS} />
          <line x1="0" y1="0" x2="0" y2={diagonalStartY} {...BORDER_PROPS} />
          <line x1="0" y1={diagonalStartY} x2="100" y2={viewHeight} {...BORDER_PROPS} />
        </svg>
        <div className="absolute flex flex-col items-center" style={{ top: ICON_OFFSET_PX.card, right: ICON_OFFSET_PX.card, gap: ICON_GAP_PX.card }}>
          {badgeTypes.map((badgeType) => {
            const BadgeIcon = BADGE_ICON_BY_TYPE[badgeType];
            return <BadgeIcon key={badgeType} style={{ width: ICON_SIZE_PX.card, height: ICON_SIZE_PX.card, ...iconStyle }} />;
          })}
        </div>
      </div>
    );
  }

  const heightPx = SINGLE_SIZE_PX.page;
  const widthPx = heightPx + MULTI_PAGE_EXTRA_WIDTH_PX * (badgeTypes.length - 1);
  const viewWidth = 100 + 60 * (badgeTypes.length - 1);

  return (
    <div className={wrapperClassName} style={{ width: widthPx, height: heightPx }} aria-hidden="true">
      <svg viewBox={`0 0 ${viewWidth} 100`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <polygon points={`0,0 ${viewWidth},0 ${viewWidth},100 100,100`} {...TRIANGLE_FILL_PROPS} />
        <line x1="0" y1="0" x2="100" y2="100" {...BORDER_PROPS} />
        <line x1="100" y1="100" x2={viewWidth} y2="100" {...BORDER_PROPS} />
      </svg>
      <div className="absolute flex items-center" style={{ top: ICON_OFFSET_PX.page, right: ICON_OFFSET_PX.page, gap: ICON_GAP_PX.page }}>
        {badgeTypes.map((badgeType) => {
          const BadgeIcon = BADGE_ICON_BY_TYPE[badgeType];
          return <BadgeIcon key={badgeType} style={{ width: ICON_SIZE_PX.page, height: ICON_SIZE_PX.page, ...iconStyle }} />;
        })}
      </div>
    </div>
  );
}