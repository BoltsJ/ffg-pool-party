import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "src/pool-party.ts",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true,
    plugins: [
      terser({ keep_classnames: true, keep_fnames: true }),
    ],
  },
  plugins: [
    copy({ targets: [{ src: "public/*", dest: "dist" }] }),
    typescript(),
  ],
};
export default config;
