import { Bell, Menu, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[rgba(255,255,255,0.9)] backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden">
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-(--app-violet)/90">
                    MetroPark
                  </p>
                  <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                    Operations Control Center
                  </h1>
                </div>
              </div>

              <div className="hidden flex-1 justify-center md:flex">
                <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-[0_0_40px_rgba(167,139,250,0.05)]">
                  <Search size={16} className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Search sessions, zones, alerts..."
                    type="text"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50">
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-(--app-rose)" />
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    Admin Operator
                  </p>
                  <p className="text-xs text-black">Level 4 Access</p>
                </div>
                <img
                  src="https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/py3k8t1ffgyhnveafakn?ik-sanitizeSvg=true"
                  alt="MetroPark Logo"
                  className="h-10 w-10 rounded-2xl object-cover"
                />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
