import { readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

const cssFiles = readdirSync(resolve(__dirname, "assets", "css"))
  .filter((file) => file.endsWith(".css"))
  .reduce((acc, file) => {
    acc[file] = `./assets/css/${file}`;
    return acc;
  }, {});

const jsFiles = readdirSync(resolve(__dirname, "assets", "js"))
  .filter((file) => file.endsWith(".js"))
  .reduce((acc, file) => {
    const key = file.slice(0, -3);
    acc[key] = `./assets/js/${file}`;
    return acc;
  }, {});

export default defineConfig(() => {
  /**
   * we use vite only in build mode. Either normal `vite build` for production build,
   * or `vite build --watch` while in dev.
   * This "hack" prevents us to having to bother with the vite server while in dev.
   *
   * Since we work like this, we override names of generated files in dev to prevent
   * generating files with different names on each save.
   */
  const inDev =
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development";

  const config = {
    // base is same as outDir because our express app serves it under /dist, not /
    base: "/dist",
    build: {
      manifest: true,
      rollupOptions: {
        input: { ...jsFiles, ...cssFiles },
      },
    },
  };

  if (inDev) {
    config.build.minify = false;
    config.build.cssMinify = false;
    config.build.rollupOptions.output = {
      entryFileNames: "assets/[name].js",
      chunkFileNames: "assets/[name].js",
      assetFileNames: "assets/[name].[ext]",
    };
  }

  return config;
});
