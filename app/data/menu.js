const menu = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  {
    name: "Workflow",
    path: "/workflow",
    children: [
      { name: "Jira", path: "/workflow/jira" },
      { name: "Bug Fixing", path: "/workflow/bug-fixing" },
      { name: "Integration Testing", path: "/workflow/integration-testing" },
      {
        name: "Air-Gapped Environment",
        path: "/workflow/air-gapped-environment",
      },
    ],
  },
  {
    name: "Experience",
    path: "/experience",
    children: [
      { name: "End-to-End Ownership", path: "/experience/sild" },
      { name: "GS인증", path: "/experience/deep-inspector" },
    ],
  },
  // { name: "Blog", path: "/blog" },
];

export default menu;
