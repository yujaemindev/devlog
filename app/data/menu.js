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
      { name: "CI/CD", path: "/workflow/cicd" },
    ],
  },
  {
    name: "Experience",
    path: "/experience",
    children: [
      { name: "End-to-End Ownership", path: "/experience/sild" },
      { name: "Good Software", path: "/experience/deep-inspector" },
      {
        name: "Air-Gapped Environment",
        path: "/experience/air-gapped-environment",
      },
    ],
  },
  // { name: "Blog", path: "/blog" },
];

export default menu;
