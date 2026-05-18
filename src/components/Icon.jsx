import { IoPerson } from "react-icons/io5";
import { sources } from "../data/sources";

export default function Icon({ icon, className = "w-5 h-5" }) {
  if (!icon) return null;

  // Plain string: either an alias or a file path (relative to public/res)
  if (typeof icon === "string") {
    const map = {
      user: IoPerson,
      person: IoPerson,
    };
    const Component = map[icon];
    if (Component) return <Component className={className} />;
    // Treat as a file path relative to public/res
    return (
      <img
        src={`res/${sources.res}/${icon}`}
        alt=""
        className={`${className} object-contain`}
      />
    );
  }

  // If a raw React component was passed directly
  if (typeof icon === "function") {
    const Component = icon;
    return <Component className={className} />;
  }

  // React icon descriptor
  if (icon.type === "react") {
    const Component = icon.value;
    return <Component className={className} />;
  }

  // File icons (public/res)
  if (icon.type === "file") {
    return (
      <img
        src={`res/${sources.res}/${icon.value}`}
        alt=""
        className={`${className} object-contain`}
      />
    );
  }

  return null;
}