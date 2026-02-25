import { cp } from "fs/promises";

await cp("src", "dist", {
  recursive: true,
  filter: (src) => {
    const isTsFile = src.match(/\.tsx?$/);
    return !isTsFile;
  },
});
