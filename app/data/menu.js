const menu = [
  { name: "Home", path: "/" },
  { name: "Career Projects", path: "/projects" },
  {
    name: "Workflow",
    path: "/workflow",
    children: [
      { name: "Jira", path: "/workflow/jira" },
      { name: "Bug Fixing", path: "/workflow/bug-fixing" },
      { name: "Integration Testing", path: "/workflow/integration-testing" },
      { name: "Air-Gapped Environment", path: "/workflow/air-gapped-environment" },
    ],
  },
  {
    name: "Experience",
    path: "/experience",
    children: [
      { name: "SILD", path: "/experience/sild" },
      { name: "DeepInspector", path: "/experience/deep-inspector" },
    ],
  },
  // { name: "Blog", path: "/blog" },
]

export default menu
