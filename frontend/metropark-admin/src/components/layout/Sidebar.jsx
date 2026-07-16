import { useEffect, useState } from "react";
import { LifeBuoy, LogOut } from "lucide-react";
import { routes } from "../../routes/routes";
import { navigateTo } from "../../routes/AppRouter";

const normalizePath = (path) => {
  if (!path || path === "") return "/";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
};

function isActivePath(routePath, currentPath) {
  return normalizePath(currentPath) === normalizePath(routePath);
}

export function Sidebar() {
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <img
            src="https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/py3k8t1ffgyhnveafakn?ik-sanitizeSvg=true"
            alt="MetroPark Logo"
            className="h-12 w-12 rounded-2xl object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">MetroPark</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-black">
              Frontend Console
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = isActivePath(route.path, pathname);
            return (
              <button
                key={route.path}
                onClick={() => navigateTo(route.path)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-(--app-violet)/10 text-(--app-violet-strong)"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{route.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={() => navigateTo("/login")}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
