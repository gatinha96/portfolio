export default function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm rounded-full border
        transition-all duration-200
        ${active ? "section-control-active" : "section-control-idle"}
      `}
    >
      {label}
    </button>
  );
}