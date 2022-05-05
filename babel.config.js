module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // 设置为false，否则 Babel 会在 Rollup 有机会做处理之前，将我们的模块转成 CommonJS ，导致 Rollup 的一些处理失败。
        modules: false,
      },
    ],
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: 3,
      },
    ],
  ],
};
