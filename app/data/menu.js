const menu = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  {
    name: "Workflow",
    path: "/workflow",
    children: [
      { name: "Team Collaboration", path: "/workflow/jira" },
      { name: "Source Control", path: "/workflow/git" },
      { name: "Bug Fixing", path: "/workflow/bug-fixing" },
      { name: "Integration Testing", path: "/workflow/integration-testing" },
      { name: "CI/CD", path: "/workflow/cicd" },
    ],
  },
  {
    name: "Experience",
    path: "/experience",
    children: [
      { name: "End-to-End Ownership", path: "/experience/sild" },
      { name: "SI project", path: "/experience/si-project" },
      { name: "Prototype Development", path: "/experience/prototype-development" },
      { name: "Open Source", path: "/experience/open-source" },
      { name: "ChatGPT with Local MCP", path: "/experience/chatgpt-local-mcp" },
      { name: "Good Software", path: "/experience/deep-inspector" },
      {
        name: "Air-Gapped Environment",
        path: "/experience/air-gapped-environment",
      },
      { name: "HTTPS Certificate", path: "/experience/https" },
      { name: "API Gateway", path: "/experience/api-gateway" },
    ],
  },
  // { name: "Blog", path: "/blog" },
];

export default menu;
