import { useRef, useEffect } from "react";

export default function FilterChips({
  featured = false,
  professional = [],
  academic = [],
  personal = false,
  skills = [],
  onRemoveFeatured,
  onRemoveProfessional,
  onRemoveAcademic,
  onRemovePersonal,
  onRemoveSkill,
}) {
  const containerRef = useRef(null);
  const prevCountRef = useRef(0);
  const totalCount = (featured ? 1 : 0) + professional.length + academic.length + (personal ? 1 : 0) + skills.length;

  useEffect(() => {
    if (totalCount > prevCountRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  const hasAny =
    featured ||
    professional.length ||
    academic.length ||
    personal ||
    skills.length;

  if (!hasAny) return null;

  // Compose chips arrays
  const associationChips = [];
  if (featured) {
    associationChips.push(
      <span key="featured" className="px-2 py-1 border rounded flex items-center gap-1 section-chip">
        Featured
        <button
          onClick={onRemoveFeatured}
          className="text-gray-400 hover:text-red-400"
        >
          ×
        </button>
      </span>
    );
  }
  professional.forEach((c) => {
    associationChips.push(
      <span
        key={c.id}
        className="px-2 py-1 border rounded flex items-center gap-1 section-chip"
      >
        {c.title}
        <button
          onClick={() => onRemoveProfessional(c.id)}
          className="text-gray-400 hover:text-red-400"
        >
          ×
        </button>
      </span>
    );
  });
  academic.forEach((s) => {
    const labelText = s.labels?.[0] ?? s.label ?? s.title;
    associationChips.push(
      <span
        key={s.id}
        className="px-2 py-1 border rounded flex items-center gap-1 section-chip"
      >
        {labelText}
        <button
          onClick={() => onRemoveAcademic(s.id)}
          className="text-gray-400 hover:text-red-400"
        >
          ×
        </button>
      </span>
    );
  });
  if (personal) {
    associationChips.push(
      <span key="personal" className="px-2 py-1 border rounded flex items-center gap-1 section-chip">
        Personal
        <button
          onClick={onRemovePersonal}
          className="text-gray-400 hover:text-red-400"
        >
          ×
        </button>
      </span>
    );
  }

  const skillChips = skills.map((s) => (
    <span
      key={s.id}
      className="px-2 py-1 border rounded flex items-center gap-1 section-chip"
    >
      {s.title}
      <button
        onClick={() => onRemoveSkill(s.id)}
        className="text-gray-400 hover:text-red-400"
      >
        ×
      </button>
    </span>
  ));

  return (
    <div ref={containerRef} className="flex gap-2 mb-6 text-xs text-gray-300 items-center overflow-x-auto whitespace-nowrap filter-chips-scrollbar">
      {associationChips}
      {associationChips.length > 0 && skillChips.length > 0 && (
        <span className="mx-1 text-gray-500">·</span>
      )}
      {skillChips}
    </div>
  );
}