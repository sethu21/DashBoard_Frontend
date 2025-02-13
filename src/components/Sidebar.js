import Link from "next/link";
import { Home, BatteryCharging, Wind, Thermometer, Settings, User, FileText, Leaf } from "lucide-react";

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="text-xl font-semibold">RTU Sensor Dashboard</div>
      <div className="mt-6">
        <Link href="/" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/sensor/port-1" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Thermometer size={20} />
          <span>Sensor 1 (TEROS 12)</span>
        </Link>
        <Link href="/sensor/port-2" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Thermometer size={20} />
          <span>Sensor 2 (TEROS 12)</span>
        </Link>
        <Link href="/sensor/port-3" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Thermometer size={20} />
          <span>Sensor 3 (TEROS 12)</span>
        </Link>
        <Link href="/sensor/summary" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <FileText size={20} />
          <span>Summary</span>
        </Link>
        <Link href="/sensor/port-7" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <BatteryCharging size={20} />
          <span>Battery</span>
        </Link>
        <Link href="/sensor/port-8" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Wind size={20} />
          <span>Barometer</span>
        </Link>
        <Link href="/sensor/lai" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Leaf size={20} />
          <span>LAI</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-700 transition">
          <User size={20} />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
