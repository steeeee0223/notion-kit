const { defineConfig } = require("@rslib/core");
console.log(
  defineConfig({
    lib: [{ format: "esm", bundle: false }],
    source: {
      entry: {
        index: ["./src/**"],
      },
    },
  }),
);
