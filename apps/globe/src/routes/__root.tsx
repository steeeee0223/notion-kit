import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontWeight: 400,
        fontStyle: "normal",
      }}
    >
      <Outlet />
    </div>
  );
}
