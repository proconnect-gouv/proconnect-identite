import { cp } from "fs/promises";

cp("src", "dist", {
  recursive: true,
  filter: (src) => {
    const isTsFile = src.match(/\.tsx?$/);
    return !isTsFile;
  },
});
