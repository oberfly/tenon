import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getModules, getContents } from "../lib/api";

export default function Dashboard() {
	const [modules, setModules] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const [modRes] = await Promise.all([getModules()]);
			if (modRes.success) setModules(modRes.data || []);
			setLoading(false);
		})();
	}, []);

	if (loading) return <p className="text-gray-400">加载中...</p>;

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Dashboard</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-white border rounded-lg p-4">
					<div className="text-sm text-gray-500">模块数</div>
					<div className="text-3xl font-bold">{modules.length}</div>
				</div>
			</div>

			<h3 className="text-lg font-semibold mt-8 mb-3">模块概览</h3>
			<div className="space-y-2">
				{modules.map((mod: any) => (
					<Link
						key={mod.id}
						to={`/contents/${mod.id}`}
						className="block bg-white border rounded-lg p-3 hover:border-blue-300 transition"
					>
						<div className="font-medium">{mod.name}</div>
						<div className="text-sm text-gray-400">
							slug: {mod.slug}
							{mod.is_enabled ? "" : " · 未启用"}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
