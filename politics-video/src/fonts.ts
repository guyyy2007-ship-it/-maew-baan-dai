import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT = "PromptTH";
export const FONT_STACK = `${FONT}, "Noto Color Emoji", sans-serif`;

const weights = ["400", "600", "800"] as const;
for (const w of weights) {
  for (const subset of ["thai", "latin"]) {
    loadFont({
      family: FONT,
      url: staticFile(`fonts/prompt-${subset}-${w}-normal.woff2`),
      weight: w,
      format: "woff2",
    });
  }
}
