const rewireLess = require("react-app-rewire-less-modules");

const {
  override,
  addDecoratorsLegacy,
  fixBabelImports,
  addLessLoader
} = require("customize-cra");

// module.exports = function override(config, env) {
//   config = rewireLess(config, env);

//   // with loaderOptions
//   config = rewireLess.withLoaderOptions({
//     modifyVars: {
//       "@primary-color": "#1890ff"
//     }
//   })(config, env);

//   return config;
// };

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
    modifyVars: { "@primary-color": "#a50052" }
  })
);
