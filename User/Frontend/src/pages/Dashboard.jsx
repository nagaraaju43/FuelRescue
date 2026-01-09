import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Fuel,
  MapPin,
  Clock,
  LogOut,
  Bell,
  Settings,
  Home,
  Navigation,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const recentRequests = [
    { id: "#4502", pump: "Shell Highroad", status: "In Transit", type: "Petrol", amount: "5L" },
    { id: "#4498", pump: "BP QuickStop", status: "Completed", type: "Diesel", amount: "10L" },
  ];

  return (
    <div className="min-h-screen bg-[#05080d] text-slate-200 flex">
      {/* 1. Slim Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0f18] flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-lg">
            <Fuel size={20} className="text-black" />
          </div>
          <span className="font-bold text-xl hidden lg:block tracking-tight text-white">
            FuelRescue
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {/* Active state for Dashboard */}
          <NavItem 
            icon={<Home size={20} />} 
            label="Dashboard" 
            active 
            onClick={() => navigate("/dashboard")} 
          />
          <NavItem
            icon={<Navigation size={20} />}
            label="Live Tracking"
            onClick={() => navigate("/nearby-pumps")}
          />
          <NavItem icon={<Clock size={20} />} label="History" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 bg-[#0a0f18]/50 backdrop-blur-md flex items-center justify-between px-8 text-white">
          <div>
            <h1 className="text-xl font-semibold">Main Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              System Status: <span className="text-green-500 underline">Operational</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0f18]"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 border-2 border-white/10" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Hero Emergency Section - LINKED TO LIVE TRACKING */}
          <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-black shadow-2xl shadow-green-500/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full text-sm font-bold mb-4">
                  <AlertCircle size={16} /> Emergency Services Active
                </div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">
                  Need Fuel Now?
                </h2>
                <p className="text-black/70 font-medium">
                  Broadcast your location to all nearby verified pumps for immediate assistance.
                </p>
              </div>
              {/* Linked via onClick */}
              <button 
                onClick={() => navigate("/nearby-pumps")}
                className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl active:scale-95"
              >
                Request Immediate Rescue
              </button>
            </div>
            <Fuel size={200} className="absolute -right-10 -bottom-10 text-black/5 rotate-12" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Fuel Ordered" value="48 Liters" icon={<Fuel size={20} />} trend="+12% this month" />
            <StatCard title="Nearby Pumps" value="12 Active" icon={<MapPin size={20} />} trend="Within 5km radius" />
            <StatCard title="Average Wait Time" value="14 Mins" icon={<Clock size={20} />} trend="-2 mins improvement" />
          </div>

          {/* Activity Table */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Requests</h3>
              <button className="text-sm text-green-400 font-semibold hover:text-green-300 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="bg-[#0a0f18] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="px-6 py-4 font-semibold text-white">Order ID</th>
                    <th className="px-6 py-4 font-semibold text-white">Service Station</th>
                    <th className="px-6 py-4 font-semibold text-white">Type/Qty</th>
                    <th className="px-6 py-4 font-semibold text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-mono text-green-400">{req.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{req.pump}</td>
                      <td className="px-6 py-4 text-slate-400">{req.type} • {req.amount}</td>
                      <td className="px-6 py-4 text-white">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === "In Transit" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Reusable Navigation Item Component
function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? "bg-green-500 text-black shadow-lg font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      {icon}
      <span className="hidden lg:block">{label}</span>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-[#0a0f18] border border-white/5 p-6 rounded-2xl hover:border-green-500/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-green-400">{icon}</div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{trend}</span>
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
    </div>
  );
}