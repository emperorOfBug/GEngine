import path from "path";
import terser from "@rollup/plugin-terser";
import ts from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import { fileURLToPath } from "url";

const { BUILD, BABEL } = process.env;
const production = BUILD === "production";
const useBabel = BABEL === "true";

export default {
	input: "./src/index.ts",
	output: {
		file: "./dist/index.js",
		sourcemap: production ? false : "inline",
		format: "es",
		name: "index"
	},
	watch: production
		? false
		: {
				exclude: "node_modules/**"
		  },
	plugins: [ts(), commonjs(), production ? terser() : null]
};
