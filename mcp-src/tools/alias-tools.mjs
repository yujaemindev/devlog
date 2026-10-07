export function registerAliasTools({ server, z, definitions }) {
  const aliases = {
    list_directory: "list_files",
    search_files: "search_text",
    edit_file: "replace_text",
    run_command: "run_dev_command",
  };

  for (const [alias, original] of Object.entries(aliases)) {
    const definition = definitions.get(original);
    if (!definition) {
      throw new Error(`Alias source tool is not registered: ${original}`);
    }

    const { options, handler } = definition;
    server.registerTool(alias, options, handler);
  }

  const create = definitions.get("write_file");
  if (!create) {
    throw new Error("write_file must be registered before create_file");
  }

  server.registerTool("create_file", {
    ...create.options,
    inputSchema: {
      file: z.string(),
      content: z.string(),
    },
  }, args => create.handler({ ...args, overwrite: false }));
}
