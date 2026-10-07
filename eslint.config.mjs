import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "no-console": "warn",
    "vue/component-api-style": ["error", ["script-setup"]],
    "vue/component-name-in-template-casing": ["error", "PascalCase", {
      registeredComponentsOnly: false,
    }],
    "vue/block-order": ["error", {
      order: ["template", "script", "style"],
    }],
  },
});
