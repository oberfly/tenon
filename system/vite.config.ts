import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	css: {
		postcss: {
			config: false, // 阻止 Vite 读取父项目 postcss.config.mjs（会误加载 tailwindcss@3）
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "../dist/system",
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://localhost:8788", // wrangler pages dev 默认端口
				changeOrigin: true,
			},
		},
	},
});
