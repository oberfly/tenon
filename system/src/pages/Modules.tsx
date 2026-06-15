import { useState, useEffect } from "react";
import { getModules, createModule, updateModule } from "../lib/api";

export default function Modules() {
	const [modules, setModules] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState({ name: "", slug: "", icon: "", ui_component: "DefaultCard" });

	useEffect(() => {
		loadModules();
	}, []);

	async function loadModules() {
		const res = await getModules();
		if (res.success) setModules(res.data || []);
		setLoading(false);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (editId) {
			await updateModule(editId, form);
		} else {
			await createModule({ ...form, id: `mod_${Date.now()}` });
		}
		setShowForm(false);
		setEditId(null);
		setForm({ name: "", slug: "", icon: "", ui_component: "DefaultCard" });
		loadModules();
	}

	function edit(mod: any) {
		setEditId(mod.id);
		setForm({ name: mod.name, slug: mod.slug, icon: mod.icon || "", ui_component: mod.ui_component || "DefaultCard" });
		setShowForm(true);
	}

	if (loading) return <p className="text-gray-400">加载中...</p>;

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold">模块管理</h2>
				<button
					onClick={() => { setEditId(null); setForm({ name: "", slug: "", icon: "", ui_component: "DefaultCard" }); setShowForm(true); }}
					className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
				>
					新增模块
				</button>
			</div>

			<div className="bg-white border rounded-lg overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50">
							<th className="text-left p-3">名称</th>
							<th className="text-left p-3">Slug</th>
							<th className="text-left p-3">组件</th>
							<th className="text-left p-3">状态</th>
							<th className="text-left p-3">操作</th>
						</tr>
					</thead>
					<tbody>
						{modules.map((mod) => (
							<tr key={mod.id} className="border-b hover:bg-gray-50">
								<td className="p-3 font-medium">{mod.name}</td>
								<td className="p-3 text-gray-500">{mod.slug}</td>
								<td className="p-3 text-gray-500">{mod.ui_component || "DefaultCard"}</td>
								<td className="p-3">
									<span className={mod.is_enabled ? "text-green-600" : "text-gray-400"}>
										{mod.is_enabled ? "启用" : "禁用"}
									</span>
								</td>
								<td className="p-3">
									<button onClick={() => edit(mod)} className="text-blue-600 hover:underline text-xs">
										编辑
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
					<form
						onSubmit={handleSubmit}
						className="bg-white rounded-lg p-6 w-96 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="text-lg font-bold mb-4">{editId ? "编辑模块" : "新增模块"}</h3>
						<div className="space-y-3">
							<input className="w-full border rounded px-3 py-2 text-sm" placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
							<input className="w-full border rounded px-3 py-2 text-sm" placeholder="slug（如 posts）" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
							<input className="w-full border rounded px-3 py-2 text-sm" placeholder="图标" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
							<input className="w-full border rounded px-3 py-2 text-sm" placeholder="组件（默认 DefaultCard）" value={form.ui_component} onChange={(e) => setForm({ ...form, ui_component: e.target.value })} />
						</div>
						<div className="flex justify-end gap-2 mt-4">
							<button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded">取消</button>
							<button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
