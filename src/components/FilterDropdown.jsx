import { forwardRef } from "react";

const FilterDropdown = forwardRef(function FilterDropdown(
  {
    label,
    selectedCount = 0,
    totalCount = 0,
    open,
    setOpen,
    id,
  },
  ref
) {
  const isOpen = open === id;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

  let baseStyle = "section-control-idle";
  if (isAllSelected) baseStyle = "section-control-active";
  else if (isPartialSelected) baseStyle = "section-control-partial";

  const shapeClass = isOpen
    ? "rounded-t-lg rounded-b-none border-b-0"
    : "rounded-lg";

  const openBorder = isOpen ? { borderColor: "var(--section-accent-line)" } : {};

  return (
    <div ref={ref} className={`relative self-stretch${isOpen ? " z-20" : ""}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => (prev === id ? null : id));
        }}
        className={`filter-dropdown-tab px-3 py-1.5 text-sm ${shapeClass} border transition flex items-center gap-2 ${baseStyle} ${isOpen ? "filter-dropdown-tab-open" : ""}`}
        style={openBorder}
      >
        {label}
        <span className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
    </div>
  );
});

export default FilterDropdown;