import { sources } from "../data/sources";

export default function HeroShell({ children }) {
  return (
    <div className="relative">
      {/* Background image layer */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('res/${sources.res}/background.jpg')`,
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 -z-10 bg-black/60" />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}