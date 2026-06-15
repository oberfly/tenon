import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getContents, createContent, updateContent, deleteContent, getModules } from "../lib/api";

export default function Contents() {
	const { moduleId } = useParams<{ moduleId: string }>();
	const [contents, setContents] = useState<any[]>([]);
	const [moduleName, setModuleName] = useState("");
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState({
		title: "",
		slug: "",
		body_md: "",
		status: "published",
		tags: "",
		description: "",
	});

	useEffect(() => {
		if (moduleId) loadData();
	}, [moduleId]);

	async function loadData() {
		const [modRes, contRes] = await Promise.all([
			getModules(),
			getContents(moduleId!),
		]);
		if (modRes.success) {
			const mod = (modRes.data || []).find((m: any) => m.id === moduleId);
			setModuleName(mod?.name || moduleId || "");
		}
		if (contRes.success) setContents(contRes.data || []);
		setLoading(false);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const customData: Record<string, unknown> = {};
		if (form.tags) customData.tags = form.tags.split(",").map((s) => s.trim());
		if (form.description) customData.description = form.description;

		const payload = {
			module_id: moduleId,
			title: form.title,
			slug: form.slug,
			body_md: form.body_md,
			status: form.status,
			custom_data: customData,
		};

		if (editId) {
			await updateContent(editId, payload);
		} else {
			await createContent({ ...payload, id: `cnt_${Date.now()}` });
		}
		setShowForm(false);
		setEditId(null);
		setForm({ title: "", slug: "", body_md: "", status: "published", tags: "", description: "" });
		loadData();
	}

	async function handleDelete(id: string) {
		if (!confirm("确定删除？删除后不可恢复。")) return;
		await deleteContent(id);
		loadData();
	}

	function edit(item: any) {
		setEditId(item.id);
		const cd = item.custom_data ? (typeof item.custom_data === "string" ? JSON.parse(item.custom_data) : item.custom_data) : {};
		setForm({
			title: item.title,
			slug: item.slug,
			body_md: item.body_md || "",
			status: item.status,
			tags: (cd.tags || []).join(", "),
			description: cd.description || "",
		});
		setShowForm(true);
	}

	if (loading) return <p className="text-gray-400">加载中...</p>;

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<Link to="/" className="text-sm text-blue-600 hover:underline">← 返回</Link>
					<h2 className="text-2xl font-bold mt-1">{moduleName} · 内容管理</h2>
				</div>
				<button
					onClick={() => { setEditId(null); setForm({ title: "", slug: "", body_md: "", status: "published", tags: "", description: "" }); setShowForm(true); }}
					className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
				>
					新增内容
				</button>
			</div>

			<div className="bg-white border rounded-lg overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50">
							<th className="text-left p-3">标题</th>
							<th className="text-left p-3">日期</th>
							<th className="text-left p-3">状态</th>
							<th className="text-left p-3">操作</th>
						</tr>
					</thead>
					<tbody>
						{contents.map((item) => (
							<tr key={item.id} className="border-b hover:bg-gray-50">
								<td className="p-3 font-medium">{item.title}</td>
								<td className="p-3 text-gray-500">{item.date?.split("T")[0] || "-"}</td>
								<td className="p-3">
									<span className={`text-xs px-2 py-0.5 rounded ${item.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
										{item.status === "published" ? "已发布" : item.status}
									</span>
								</td>
								<td className="p-3 flex gap-2">
									<button onClick={() => edit(item)} className="text-blue-600 hover:underline text-xs">编辑</button>
									<button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs">删除</button>
								</td>
							</tr>
						))}
						{contents.length === 0 && (
							<tr><td colSpan={4} className="p-6 text-center text-gray-400">暂无内容</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
					<form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
						<h3 className="text-lg font-bold mb-4">{editId ? "编辑内容" : "新增内容"}</h3>
						<div className="space-y-3">
							<div>
								<label className="text-xs text-gray-500">标题</label>
								<input className="w-full border rounded px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
							</div>
							<div>
								<label className="text-xs text-gray-500">Slug（URL 标识）</label>
								<input className="w-full border rounded px-3 py-2 text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
							</div>
							<div>
								<label className="text-xs text-gray-500">标签（逗号分隔）</label>
								<input className="w-full border rounded px-3 py-2 text-sm" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
							</div>
							<div>
								<label className="text-xs text-gray-500">摘要</label>
								<input className="w-full border rounded px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
							</div>
							<div>
								<label className="text-xs text-gray-500">正文（Markdown）</label>
								<textarea className="w-full border rounded px-3 py-2 text-sm font-mono" rows={12} value={form.body_md} onChange={(e) => setForm({ ...form, body_md: e.target.value })} />
							</div>
							<div>
								<label className="text-xs text-gray-500">状态</label>
								<select className="w-full border rounded px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
									<option value="published">已发布</option>
									<option value="draft">草稿</option>
									<option value="archived">归档</option>
								</select>
							</div>
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
