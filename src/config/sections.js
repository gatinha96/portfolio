import { sections } from "@datapack/config";
export { sections };

const SECTION_SATURATION = 83;
const SECTION_BASE_VALUE = 7;
const SECTION_STICKY_VALUE = 9;
const SECTION_ACTIVE_VALUE = 12;
const SECTION_CARD_VALUE = 11;
const SECTION_CARD_BORDER_SATURATION = 45;
const SECTION_CARD_BORDER_VALUE = 25;
const SECTION_CONTROL_VALUE = 10;
const SECTION_CONTROL_HOVER_VALUE = 14;
const SECTION_SOFT_VALUE = 23;
const SECTION_SOFT_HOVER_VALUE = 27;
const SECTION_ACCENT_VALUE = 58;
const SECTION_ACCENT_HOVER_VALUE = 66;
const SECTION_ACCENT_LINE_VALUE = 80;
const SECTION_ACCENT_BORDER_SATURATION = 74;
const SECTION_ACCENT_BORDER_VALUE = 74;
const SECTION_CONTROL_BORDER_SOFT_VALUE = 40;
const SECTION_CONTROL_BORDER_SOFT_SATURATION = 30;
const SECTION_STICKY_ALPHA = 0.95;
const SECTION_ACTIVE_ALPHA = 0.3;

function hsvToRgb(hue, saturation, value) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const chroma = (value / 100) * (saturation / 100);
  const huePrime = normalizedHue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = (value / 100) - chroma;

  return {
    red: Math.round((red + match) * 255),
    green: Math.round((green + match) * 255),
    blue: Math.round((blue + match) * 255),
  };
}

function toCssColor(hue, value, alpha = 1, saturation = SECTION_SATURATION) {
  const { red, green, blue } = hsvToRgb(hue, saturation, value);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getRelativeLuminance({ red, green, blue }) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function getReadableTextColor(rgb) {
  return getRelativeLuminance(rgb) > 0.42 ? "#020617" : "#f8fafc";
}



const sectionThemeById = Object.fromEntries(
  sections.map((section) => [
    section.id,
    (() => {
      const accentRgb = hsvToRgb(section.hue, SECTION_SATURATION, SECTION_ACCENT_VALUE);

      return {
        baseBackground: toCssColor(section.hue, SECTION_BASE_VALUE),
        activeBackground: toCssColor(section.hue, SECTION_ACTIVE_VALUE),
        stickyBackground: toCssColor(section.hue, SECTION_STICKY_VALUE, SECTION_STICKY_ALPHA),
        stickyActiveOverlay: toCssColor(section.hue, SECTION_ACTIVE_VALUE, SECTION_ACTIVE_ALPHA),
        cardBackground: toCssColor(section.hue, SECTION_CARD_VALUE, 0.58),
        cardBackgroundStrong: toCssColor(section.hue, SECTION_CONTROL_VALUE, 0.84),
        cardBorder: toCssColor(
          section.hue,
          SECTION_CARD_BORDER_VALUE,
          0.62,
          SECTION_CARD_BORDER_SATURATION
        ),
        controlBackground: toCssColor(section.hue, SECTION_CONTROL_VALUE, 0.92),
        controlHoverBackground: toCssColor(section.hue, SECTION_CONTROL_HOVER_VALUE, 0.96),
        controlBorder: toCssColor(section.hue, SECTION_CARD_BORDER_VALUE, 0.8, 56),
        softBackground: toCssColor(section.hue, SECTION_SOFT_VALUE, 0.3),
        softHoverBackground: toCssColor(section.hue, SECTION_SOFT_HOVER_VALUE, 0.4),
        accentBackground: toCssColor(section.hue, SECTION_ACCENT_VALUE, 0.96),
        accentHoverBackground: toCssColor(section.hue, SECTION_ACCENT_HOVER_VALUE, 0.98),
        accentBorder: toCssColor(
          section.hue,
          SECTION_ACCENT_BORDER_VALUE,
          0.92,
          SECTION_ACCENT_BORDER_SATURATION
        ),
        accentLine: toCssColor(section.hue, SECTION_ACCENT_LINE_VALUE),
        accentRing: toCssColor(section.hue, SECTION_ACCENT_LINE_VALUE, 0.9),
        controlBorderSoft: toCssColor(
          section.hue,
          SECTION_CONTROL_BORDER_SOFT_VALUE,
          0.8,
          SECTION_CONTROL_BORDER_SOFT_SATURATION
        ),
        accentText: getReadableTextColor(accentRgb),
      };
    })(),
  ])
);

export function getSectionTheme(sectionId) {
  return sectionThemeById[sectionId] ?? sectionThemeById["about-me"];
}

export function getSectionStyleVars(sectionId) {
  const theme = getSectionTheme(sectionId);

  return {
    "--section-base-bg": theme.baseBackground,
    "--section-active-bg": theme.activeBackground,
    "--section-sticky-bg": theme.stickyBackground,
    "--section-sticky-overlay": theme.stickyActiveOverlay,
    "--section-card-bg": theme.cardBackground,
    "--section-card-bg-strong": theme.cardBackgroundStrong,
    "--section-card-border": theme.cardBorder,
    "--section-control-bg": theme.controlBackground,
    "--section-control-hover-bg": theme.controlHoverBackground,
    "--section-control-border": theme.controlBorder,
    "--section-control-border-soft": theme.controlBorderSoft,
    "--section-soft-bg": theme.softBackground,
    "--section-soft-hover-bg": theme.softHoverBackground,
    "--section-accent-bg": theme.accentBackground,
    "--section-accent-hover-bg": theme.accentHoverBackground,
    "--section-accent-border": theme.accentBorder,
    "--section-accent-line": theme.accentLine,
    "--section-accent-ring": theme.accentRing,
    "--section-accent-text": theme.accentText,
  };
}