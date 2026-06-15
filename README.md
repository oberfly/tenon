Tenon 是一个极致纯粹、动静绝对分离的现代动态内容引擎。基于 Astro 6 直驱 SQLite 数据库，坚守纯 SSG 底线，面向访客 100% 预构建静态 HTML；针对动态交互，采用 React 孤岛架构按需水合，结合 Astro 6 Live Collections 支持 OAuth 登录、评论、点赞等用户交互行为，实现核心内容极速加载与动态交互的完美平衡。

数据层采用“元数据驱动+JSON 宽表”实现零代码动态建模，支持任意内容类型的自由扩展；前端回归纯 CSS 变量与 React 孤岛，实现数据与展示逻辑的绝对解耦与零门槛 Tenon Theme 制作。Tenon System 支持内容、模块、字段及主题等系统配置的视窗化录入，降低运维成本；同时秉承“多源汇聚，一库直驱”理念，通过 Tenon Plugin API 无缝接入 Notion、本地 Markdown 等第三方数据源汇聚入库。

全栈 Cloudflare（Pages / D1 / R2 / KV）零成本构建，开箱即用（架构支持适配其他任意边缘平台），享受极致性能与数据主权。

Tenon is an extremely pure, modern dynamic content engine with strict separation of static and dynamic architectures. Based on Astro 6 directly querying an SQLite database, it adheres to a strict SSG baseline, serving 100% pre-built static HTML to visitors; for dynamic interactions, it adopts the React island architecture with on-demand hydration, coupled with Astro 6 Live Collections to support OAuth login, comments, likes, and other user interaction behaviors, achieving a perfect balance between lightning-fast core content loading and dynamic interactions.

The data layer utilizes “metadata-driven + JSON wide tables” to achieve zero-code dynamic modeling, supporting the free extension of arbitrary content types; the frontend returns to pure CSS variables and React islands, achieving absolute decoupling between data and presentation logic, and zero-barrier Tenon Theme creation. Tenon System supports the visual configuration and entry of system settings such as content, modules, fields, and themes, reducing operational costs; meanwhile, adhering to the philosophy of “Multi-source Aggregation, Single-database Drive”, it seamlessly integrates third-party data sources like Notion and local Markdown into the database via the Tenon Plugin API.

Built on the full Cloudflare stack (Pages / D1 / R2 / KV) at zero cost, ready out-of-the-box (with an architecture that supports adaptation to any other edge platform), letting you enjoy extreme performance and data sovereignty.
