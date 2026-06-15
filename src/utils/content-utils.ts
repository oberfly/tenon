import { getCollection, render } from "astro:content";

type PostLocale = "zh-CN" | "en";

function normalizeLocale(locale?: string): PostLocale {
	const normalized = locale?.replace(/_/g, "-").toLowerCase();
	return normalized === "en" ? "en" : "zh-CN";
}

function matchPostLocale(lang: string | undefined, locale: PostLocale): boolean {
	if (locale === "en") {
		return lang === "en";
	}

	return lang === undefined || lang === "" || lang === "zh-CN" || lang === "zh_CN";
}


export async function getSortedPosts(locale?: string) {
	const shouldFilterByLocale = typeof locale === "string" && locale.trim() !== "";
	const currentLocale = shouldFilterByLocale ? normalizeLocale(locale) : null;

	const allBlogPosts = await getCollection("posts", ({ data }) => {
		const draftPassed = import.meta.env.PROD ? data.draft !== true : true;
		if (!draftPassed) return false;
		if (!currentLocale) return true;
		return matchPostLocale(data.lang, currentLocale);
	});
	const sorted = allBlogPosts.sort((a, b) => {
		// 如果一个是置顶一个不是置顶，置顶的排在前面
		if (a.data.pinned !== b.data.pinned) {
			return a.data.pinned ? -1 : 1;
		}
		// 都是置顶或都不是置顶，按发布日期时间排序（包含小时分钟秒）
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	for (const post of sorted) {
		post.data.prevSlug = "";
		post.data.prevTitle = "";
		post.data.nextSlug = "";
		post.data.nextTitle = "";
	}

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].id;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].id;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(locale?: string): Promise<Tag[]> {
	const shouldFilterByLocale = typeof locale === "string" && locale.trim() !== "";
	const currentLocale = shouldFilterByLocale ? normalizeLocale(locale) : null;

	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		const draftPassed = import.meta.env.PROD ? data.draft !== true : true;
		if (!draftPassed) return false;
		if (!currentLocale) return true;
		return matchPostLocale(data.lang, currentLocale);
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.map((post: { data: { tags: string[] } }) => {
		post.data.tags.map((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

// ==================== 图书相关函数 ====================

export type Book = {
	slug: string;
	title: string;
	author?: string;
	translator?: string;
	published?: Date;
	updated?: Date;
	description: string;
	image: string;
	tags: string[];
	status: 'ongoing' | 'completed' | 'paused';
	chapterCount: number;
	body: string;
	render: () => Promise<{ Content: any }>;
};

export type BookChapter = {
	slug: string;
	chapterSlug: string;
	title: string;
	order: number;
	draft: boolean;
	body: string;
	render: () => Promise<{ Content: any; headings: any[] }>;
	prevChapter?: { slug: string; title: string };
	nextChapter?: { slug: string; title: string };
};

/**
 * 获取所有图书列表
 *
 * glob loader 下 entry.id 形如 "书目录名" (index.md) 或 "书目录名/01-xxx" (章节)。
 * 旧 slug 语义一致（index.md 的 id 就是目录名）。
 */
export async function getBooks(): Promise<Book[]> {
	const allBookEntries = await getCollection("books", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 找出所有 index 文件（图书元信息）
	// glob loader 下 index.md 的 id 为目录名（不含 /index）
	const metaEntries = allBookEntries.filter(entry => !entry.id.includes('/'));

	const books: Book[] = [];

	for (const meta of metaEntries) {
		const bookSlug = meta.id;

		// 计算该书的章节数
		const chapters = allBookEntries.filter(entry =>
			entry.id.startsWith(bookSlug + '/') &&
			(import.meta.env.PROD ? entry.data.draft !== true : true)
		);

		books.push({
			slug: bookSlug,
			title: meta.data.title,
			author: meta.data.author,
			translator: meta.data.translator,
			published: meta.data.published,
			updated: meta.data.updated,
			description: meta.data.description,
			image: meta.data.image,
			tags: meta.data.tags,
			status: meta.data.status,
			chapterCount: chapters.length,
			body: meta.body || '',
			// Astro 6: render 是独立函数，闭包绑定 entry 保留旧调用方式
			render: () => render(meta),
		});
	}

	// 按更新时间排序，最新的在前
	return books.sort((a, b) => {
		const dateA = a.updated || a.published || new Date(0);
		const dateB = b.updated || b.published || new Date(0);
		return dateB.getTime() - dateA.getTime();
	});
}

/**
 * 根据 slug 获取单本图书
 */
export async function getBookBySlug(bookSlug: string): Promise<Book | undefined> {
	const books = await getBooks();
	return books.find(book => book.slug === bookSlug);
}

/**
 * 获取图书的所有章节
 */
export async function getBookChapters(bookSlug: string): Promise<BookChapter[]> {
	const allBookEntries = await getCollection("books", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 筛选出该书的章节（以 bookSlug/ 开头的都是章节）
	const chapterEntries = allBookEntries.filter(entry =>
		entry.id.startsWith(bookSlug + '/')
	);

	// 按文件名排序（利用 01- 02- 前缀）
	const sorted = chapterEntries.sort((a, b) => {
		const aName = a.id.split('/').pop() || '';
		const bName = b.id.split('/').pop() || '';
		return aName.localeCompare(bName);
	});

	const chapters: BookChapter[] = sorted.map((entry, index) => {
		const chapterSlug = entry.id.split('/').pop() || '';
		return {
			slug: entry.id,
			chapterSlug,
			title: entry.data.title,
			order: index + 1,
			draft: entry.data.draft,
			body: entry.body || '',
			// Astro 6: render 是独立函数，闭包绑定 entry 保留旧调用方式
			render: () => render(entry),
		};
	});

	// 设置上下章导航
	for (let i = 0; i < chapters.length; i++) {
		if (i > 0) {
			chapters[i].prevChapter = {
				slug: chapters[i - 1].chapterSlug,
				title: chapters[i - 1].title,
			};
		}
		if (i < chapters.length - 1) {
			chapters[i].nextChapter = {
				slug: chapters[i + 1].chapterSlug,
				title: chapters[i + 1].title,
			};
		}
	}

	return chapters;
}

/**
 * 获取单个章节
 */
export async function getChapter(bookSlug: string, chapterSlug: string): Promise<BookChapter | undefined> {
	const chapters = await getBookChapters(bookSlug);
	return chapters.find(ch => ch.chapterSlug === chapterSlug);
}
