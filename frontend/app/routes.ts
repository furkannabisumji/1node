import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("onboarding", "./routes/onboarding.tsx"),
  route("dashboard", "./routes/dashboard.tsx"),
  route("automations", "./routes/automations.tsx"),
  route("automations/create", "./routes/automations.create.tsx"),
  route("automations/:id", "./routes/automations.$id.tsx")
] satisfies RouteConfig;
