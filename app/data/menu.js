const menu = [
  { name: "Home", path: "/" },
  { name: "Career Projects", path: "/projects" },
  {
    name: "Workflow",
    path: "/workflow",
    children: [
      { name: "Jira", path: "/workflow/jira" },
      { name: "Bug Fixing", path: "/workflow/bug-fixing" },
    ],
  },
  // { name: "Blog", path: "/blog" },
]

export default menu
