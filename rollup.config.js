import packageJSON from "./package.json";
import resolve from "rollup-plugin-node-resolve"; // 依赖引用插件
import commonjs from "rollup-plugin-commonjs"; // commonjs模块转换插件
import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".ts"];

const commonConf = {
  input: "src/index.ts",
  plugins: [
    resolve(extensions),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    babel({ babelHelpers: "bundled", extensions }),
    terser(),
  ],
};

const outputs = [
  {
    file: packageJSON.main, // 通用模块
    format: "cjs",
  },
  {
    file: packageJSON.module, // es6模块
    format: "es",
  },
];

const buildConf = (options) => Object.assign({}, commonConf, options);

export default outputs.map((output) =>
  buildConf({ output: { name: packageJSON.name, ...output } })
);
