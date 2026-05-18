import { cover } from "@datapack/cover";
import { sources } from "../data/sources";

export const heroBackgroundStyle = {
  backgroundImage: `url("res/${sources.res}/${cover.background}")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
};