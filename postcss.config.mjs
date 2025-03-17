import { purgeCSSPlugin } from "@fullhuman/postcss-purgecss";

export const plugins = [
  purgeCSSPlugin({
    content: ["./src/views/**/*.ejs", "./assets/**/*.js"],
    css: ["./assets/**/*.css"],
    variables: true,
    safelist: {
      greedy: [
        /choices/,
        /fr-modal--opened/, // Useful for the responsive burger menu.
      ],
    },
  }),
];
