import Icon from "./Icon";
import { contact, map } from "@datapack/contact";
import { getSectionTheme } from "../config/sections";

export default function Contact({ isActive, isPrevious = false, activeAccentLine }) {
  const sectionTheme = getSectionTheme("contact");

  return (
    <section id="contact" className="py-16">

      <div
        className="sticky top-12 lg:top-0 z-40 backdrop-blur border-b mb-6 relative transition-colors duration-300"
        style={{
          backgroundColor: isActive ? 'var(--section-active-bg)' : 'var(--section-base-bg)',
          borderBottomColor: isActive
            ? sectionTheme.accentBorder
            : isPrevious
            ? activeAccentLine
            : sectionTheme.controlBorder,
        }}
      >
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{ backgroundColor: isActive ? sectionTheme.stickyActiveOverlay : "transparent" }}
        />
        <div className="relative pt-4 pb-2">
          <h2 className="text-3xl font-bold">Contact</h2>
        </div>
      </div>

      <p className="mt-4 text-gray-400">Feel free to reach out 👇</p>

      <div className="mt-6 flex flex-col md:flex-row md:items-start md:gap-12">
        <div className="md:w-1/2">
          <div className="space-y-3">
            {contact.map((c, i) => {
              const href = c.address || c.value || "";
              const isUrl = String(href).startsWith("http");
              const isEmail = String(href).includes("@");
              const label = c.value;

              return (
                <div key={i} className="flex items-center gap-3">
                  {c.icon && <Icon icon={c.icon} />}
                  {isUrl ? (
                    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-gray-200 underline" title={c.title}>
                      {label}
                    </a>
                  ) : isEmail ? (
                    <a href={`mailto:${href}`} className="text-sm text-gray-200" title={c.title}>
                      {label}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-200" title={c.title}>{label}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {map?.embed && (
          <div className="mt-6 md:mt-0 md:w-1/2">
            <a href={map.link || map.embed} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-colors">
              <iframe
                src={map.embed}
                title="Location map"
                className="w-full h-52 pointer-events-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}