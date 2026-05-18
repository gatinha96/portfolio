import Icon from "./Icon";
import ProjectStatusBadge from "./ProjectStatusBadge";

export default function SkillCard({ skill, highlighted = false, connected = false, onClick }) {
  const stateClass = highlighted ? 'section-control-active' : 'section-control-idle';
  const isFeatured = skill.tags?.includes("featured");

  const stretch = highlighted || connected;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative group flex items-center gap-3 px-3 py-2 rounded-t-lg ${isFeatured ? 'pr-8' : ''}
        border text-left w-full h-full overflow-visible
        transition-[border-radius,border-bottom-width,background-color,border-color,color] duration-200 ease-out
        ${stateClass}
      `}
      style={{
        borderBottomLeftRadius: connected ? "0px" : "0.5rem",
        borderBottomRightRadius: connected ? "0px" : "0.5rem",
        borderBottomWidth: connected ? "0px" : undefined,
        zIndex: connected ? 10 : 0,
      }}
      title={skill.title}
    >
      <ProjectStatusBadge
        badges={isFeatured ? ["featured"] : []}
        variant="card"
        className="origin-top-right scale-[0.64]"
        iconColor={highlighted ? "#ffffff" : undefined}
      />

      <div
        className="flex items-center gap-3 min-w-0"
        style={{
          transform: stretch ? 'translateY(4px)' : 'translateY(0)',
          transition: 'transform 0.18s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          className={`flex-shrink-0 ${
            highlighted ? "" : "text-gray-300 group-hover:text-white"
          }`}
          style={highlighted ? { color: "var(--section-accent-text)" } : undefined}
        >
          <Icon icon={skill.icon} />
        </div>

        <span className="min-w-0 text-sm font-medium">{skill.title}</span>
      </div>

      <div
        aria-hidden="true"
        data-skillcard-connector
        className="absolute pointer-events-none"
        style={{
          left: "-1px",
          right: "-1px",
          bottom: "-0.75rem",
          height: "0.75rem",
          backgroundColor: "var(--section-accent-bg)",
          borderLeft: "1px solid var(--section-accent-border)",
          borderRight: "1px solid var(--section-accent-border)",
          opacity: connected ? 1 : 0,
          transform: connected ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "top center",
          transition:
            "transform 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.14s ease-out",
        }}
      />
    </button>
  );
}