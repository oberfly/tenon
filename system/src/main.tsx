import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import Contents from "./pages/Contents";

function Layout() {
	const location = useLocation();

	return (
		<div className="min-h-screen flex">
			{/* Sidebar */}
			<aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-1">
				<h1 className="text-lg font-bold mb-4">Tenon System</h1>
				<Link
					to="/"
					className={`px-3 py-2 rounded text-sm ${location.pathname === "/" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
				>
					Dashboard
				</Link>
				<Link
					to="/modules"
					className={`px-3 py-2 rounded text-sm ${location.pathname === "/modules" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
				>
					模块管理
				</Link>
				<div className="mt-auto text-xs text-gray-400">Tenon v0.1</div>
			</aside>

			{/* Main */}
			<main className="flex-1 p-6">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/modules" element={<Modules />} />
					<Route path="/contents/:moduleId" element={<Contents />} />
				</Routes>
			</main>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Layout />
		</BrowserRouter>
	</React.StrictMode>,
);
