const rewireLess = require("react-app-rewire-less-modules");
const colors = require("./src/styles/colors");

console.log(".. colors", colors);

const {
  override,
  addDecoratorsLegacy,
  fixBabelImports,
  addLessLoader
} = require("customize-cra");

function myOverrides(config) {
  // do stuff to config
  return config;
}

module.exports = override(
  myOverrides,
  addDecoratorsLegacy(),

  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),

  addLessLoader({
    javascriptEnabled: true,
    modifyVars: colors
  })
);
