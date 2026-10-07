import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const workspace = fileURLToPath(new URL("../", import.meta.url));
const source = path.resolve(workspace, process.argv[2] || "../fire-command-center-react");
const sourceRequire = createRequire(path.join(source, "package.json"));
const { build } = await import(pathToFileURL(sourceRequire.resolve("vite")).href);
const { default: react } = await import(pathToFileURL(sourceRequire.resolve("@vitejs/plugin-react")).href);

await build({
  configFile: false,
  root: source,
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.join(workspace, "public/demos/fire-command-center"),
    emptyOutDir: false,
  },
});
