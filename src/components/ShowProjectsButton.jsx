export default function ShowProjectsButton({ onClick, count, className = "", all = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-fit rounded border px-3 py-2 text-xs font-normal transition section-accent-button ${className}`}
    >
      {count !== undefined
        ? all
          ? `Show all projects (${count})`
          : `Show ${count} project${count !== 1 ? 's' : ''}`
        : all
          ? 'Show all projects'
          : 'Show projects'}
    </button>
  );
}
