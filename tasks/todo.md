# Better Auth 升級工作清單

狀態：核心實作與套件/consumer 檢查已完成；真實外部整合與跨站瀏覽器驗證未執行。設計與驗證原則見 [plan.md](./plan.md)。以下檔案路徑以 repository root 為基準；新增檔案與目前實作位置依實際 repository 為準。

所有任務遵循最小實作原則：優先官方功能，不新增沒有實際需求的抽象、平台或 wrapper；替換功能時同步刪除失去用途的 function/exports。保留必要的設定面板資料組合及安全檢查。

## 進度判讀

`[x]` 表示該條敘述已有實作證據，不表示其章節下所有驗證均已通過。含未執行測試或部署工作的複合條目保持 `[ ]`。整合提交為 `543f12c2`，前序提交為 `c070a7ae`、`833edd8e`、`5aa44468`；詳細決策與驗證邊界見 [auth-audit.md](./auth-audit.md)。

本機驗證快照：auth 63 tests、auth-ui 43 tests、settings-panel 14 tests，各套件 typecheck/lint/build 通過。auth-server 14 tests 與 typecheck/lint/build、e2e import 19 tests 已通過。schema generation 在最終 Drizzle 0.45.2 下仍與原檔 SHA1 一致，沒有 DB 操作。notion-clone 最終 typecheck、lint、Next production build 通過。Storybook 透過瀏覽器確認 Login 表單、Forgot password 入口、Settings Account/People/Billing 渲染與分頁切換；使用 mock，未驗證真實 auth。Storybook Vitest addon 仍在測試執行前因 Rsbuild preset/Vite alias JSX 設定失敗，不能列為 tests 通過。 table-view build 已通過，但先前全套測試兩個 timeout 尚未重跑；docs production build 尚未完成。這些結果不代表整個 repository 全部檢查通過。 **真實 PostgreSQL、寄信、OAuth、WebAuthn、Stripe 與跨站瀏覽器測試尚未執行。**

| 範圍    | 已實作                                                                         | 尚待驗證或完成                                                                      |
| ------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| T00–T03 | 共用服務契約、版本選定、generation entrypoint、最終 schema 與 rate_limit model | generation 連跑兩次 SHA1 與原檔一致；真實 PostgreSQL 未跑；consumer checks 已通過。 |
| T04–T08 | 官方 account selector、workspace/team/invitation、角色擴充、session 簡化       | 完整競爭/容量/邀請邊界整合；城市定位已改為 IP 顯示。                                |
| T09–T12 | CORS/HTTP、可信 proxy IP、官方 email、reset UI、敏感能力拒絕、2FA challenge    | 真實寄信、OAuth、WebAuthn、兩 app cookie 與跨站瀏覽器未跑。                         |
| T13–T15 | Stripe 22、授權 customer extension、上傳驗證、adapter 錯誤及多角色處理         | 真實 Stripe/webhook、Supabase 與外部整合回歸。                                      |
| T16     | 指定範圍 unused 清理、接入 README、功能審查紀錄                                | Storybook addon 設定失敗，browser mock 操作確認通過；globe/map-server 排除。        |

**未執行：真實 PostgreSQL、實際郵件寄達、OAuth provider、WebAuthn 驗證器、Stripe test-mode、跨站瀏覽器測試。沒有執行 migration、baseline、回填或 db:push。**

## T00：確定共用服務與顯示資料契約

- [ ] 依已確認的自有 app 範圍定義共用 auth API 接入；沿用 user/organization 模型，記錄訂閱共享方式，驗證直接 cookie 請求與必要的同源轉送，不建立第三方 OAuth/OIDC 平台。
- [x] 以官方來源/回跳設定滿足多 app 接入，僅為實際需要的 invitation/reset/品牌資訊增加最小配置；核心服務不綁定 React UI，也不新增 app registry 或 appId 資料模型。
- [x] 逐一列出 settings-panel 的資料欄位、分頁與請求數需求，作為保留組合 endpoint 的依據；不因存在基本官方 API 就刪除仍有必要的組合查詢。

驗證：至少兩個不同來源 app 的接入案例與資料契約測試案例已定義。相依：無，使用者已確認自有 app 直接使用共用 auth endpoints。範圍：S。

檔案：`tasks/plan.md`、`apps/auth-server/README.md`、預定接入契約測試。

## T01：確認版本並建立測試基礎

- [x] 查 npm latest、官方 release、passkey/stripe/CLI 的相容版本，加入官方 Email Service 所需的相容 `@better-auth/infra`；納入 Node `stripe` 20 → 22 的相容性檢查，與 T13a 同一升級批次更新 manifest/catalog/lockfile。
- [x] 為 auth/auth-ui 加入 Vitest 設定，建立可注入測試 DB 的 auth fixture，沿用 workspace catalog。
- [x] 記錄升級前可重現的主要問題與官方功能契約；不把測試替身加入 production API。

驗證：兩套件能執行 focused test；既有 import 測試基準已記錄。相依：無。範圍：M，必要時拆成版本與測試兩步。

檔案：`packages/auth/package.json`、`packages/auth-ui/package.json`、兩套件新增 `vitest.config.ts` 與測試 fixture；`pnpm-lock.yaml` 為 generated change。

## T02：讓 schema 產生可重現

- [x] 改用目標版官方 CLI，提供可載入的 generation auth instance，包含所有啟用過的必要 plugin model。
- [x] 明確區分官方 schema 與產品擴充的來源，保留 emoji、teamspace 欄位、外鍵與 relations。
- [x] 產生過程不依賴正式服務；連續執行兩次結果一致，不遺失產品欄位。

驗證：generation diff 與 typecheck；核對 account、session、team、teamMember、2FA、passkey、subscription 全部定義。相依：T01、T13a 的版本選定與安裝。範圍：M。

檔案：`packages/auth/package.json`、新增 generation config、`packages/auth/src/db/schemas.ts`、`packages/auth/src/lib/utils.ts`、`packages/auth/drizzle.config.ts`。

## T03：核對最終 schema

- [x] 直接更新 schema 所需欄位、default、index、unique、外鍵與 relations，與目標版本的官方模型一致。
- [x] 保留必要產品欄位，移除已被取代的自訂欄位與相容定義。
- [x] 不建立 migration SQL、baseline、回填或演練；不執行 `db:push` 或遠端 DB 結構操作。

驗證：schema 產生結果可重現、diff review 與 typecheck。相依：T02。範圍：S。

檔案：`packages/auth/src/db/schemas.ts`，必要時調整 generation config。

### 檢查點 A

- [x] 版本與 schema 差異有證據，schema 產生與型別檢查通過；失敗時修正後才進入 API 切換。

## T04：遷移連結帳號操作

- [x] `accountInfo` 與 `unlinkAccount` 使用本地 account row ID，移除舊 provider selector。
- [x] 不對 credential 帳號查 provider profile；錯誤不得變成空清單或成功解除連結。
- [ ] 測試同 provider 不同帳號、未知 selector 與最後一個登入方式的保護。

驗證：先寫失敗的 adapter/handler 測試，再執行 auth-ui focused tests 與 typecheck。相依：T01。範圍：S。

檔案：`packages/auth-ui/src/adapters/utils.ts`、相鄰測試，必要時調整 `packages/settings-panel/src/lib/types.ts`。

## T05：改用官方工作區 API

- [x] 工作區資料與角色優先使用官方 API，按 T00 契約保留或刪除 `getWorkspaceDetail`；移除所有 owner fallback，區分訂閱關閉與查詢失敗。
- [ ] slug 使用字串產生與官方查重/建立，移除 `getUniqueSlug`，處理並行建立衝突。
- [ ] 工作區建立完成才回報成功，切換成功後 query/cache 與角色顯示一致。

驗證：建立、切換、查詢失敗與跨組織讀取測試。相依：T00、T02、T04。範圍：M。

檔案：`organization-extra.ts`、`use-workspace-adapter.ts`、`use-create-workspace-form.ts` 及各自測試。

## T06：由官方管理團隊 membership

- [x] 團隊查詢優先使用官方資源，保留設定面板必要的批次組合 endpoint；新增/移除 membership 使用官方 API，刪除直接 insert membership。
- [x] 核對官方 teamMember additional fields 能力；僅保留無等價 API 的 teamspace 角色擴充，限制合法角色與伺服器授權。
- [ ] 維持 teamspace owner 語意，測試重複/並行加入、目標不屬於組織、容量限制與移除後計數；產品角色寫入失敗不回報全部成功。

驗證：真實 handler + PostgreSQL membership 測試，adapter 組合查詢與分頁測試。相依：T03、T05。範圍：M，先拆 membership，再處理角色擴充。

檔案：`organization-extra.ts`、`auth/src/lib/utils.ts`、`use-teamspaces-adapter.ts`、對應測試；必要的 schema 調整回到 T02/T03 驗證。

## T07：遷移邀請列表與接受流程

- [x] 使用官方邀請 API，核對 inviter 資料與分頁契約；只在缺少官方資料時保留最小授權查詢。
- [ ] 驗證邀請者已離開、取消/過期邀請、錯誤 email 與未驗證 email 的行為，禁止匿名或跨組織列舉。
- [x] 接受成功後正確更新工作區狀態，失敗不觸發成功 callback。

驗證：handler/adapter 測試與邀請 UI 測試；確認寄信依 T10 的真實 callback。相依：T05、T06。範圍：M。

檔案：`organization-extra.ts`、`use-invitations-adapter.ts`、`use-accept-invitation-form.ts` 與測試。

### 檢查點 B

- [ ] 工作區、團隊、邀請已走官方流程；保留的自訂端點逐一有官方缺口理由與授權測試。

## T08：縮減 session 擴充

- [x] IP/userAgent 由官方管理，裝置顯示在 adapter 推導；移除重複 session device 欄位與寫入。
- [x] 初始組織只在 create.before 選定，不在每次 session 更新重新指定。
- [x] 依確認後的功能取捨移除外部定位 HTTP 服務與儲存欄位；裝置由 userAgent 推導，位置改顯示 IP，不宣稱官方有城市定位。

驗證：session 首次回應包含正確工作區、更新不被覆蓋、登入不依賴定位 HTTP 服務、裝置顯示與撤銷正常。相依：T03、T05。範圍：分兩個 M 步驟：session hook；顯示/定位與欄位移除。

檔案：`auth/src/db/actions.ts`、`auth/src/auth.ts`、`auth/src/lib/utils.ts`、`auth-ui/src/adapters/utils.ts`、session 測試；直接更新最終 schema 並依 T03 核對。

## T09：收斂 auth 設定與代理信任

已補官方 database rateLimit 與 rate_limit table；Fastify 覆寫 x-auth-client-ip 並只信任 TRUSTED_PROXY_IPS。HTTP body limit 為 7 MiB，plugin decoded image limit 為 5 MiB。健康檢查使用官方 /api/auth/ok。

先完成以下 HTTP 邊界子任務，再修改 factory 設定；每步分開驗證。

### T09a：讓多個 app 接入 Fastify 服務

- [x] 依 T00 設定處理精確 CORS allowlist、preflight 與 credentials，保持 trustedOrigins 與 CORS 各自的安全檢查。
- [x] 測試 JSON/form body、原始 webhook bytes、多個 Set-Cookie、status 與 redirect 的完整傳遞，修正必要的 Fastify handler 邊界。
- [ ] 兩個 app 分別完成登入/session/登出；未登錄 app、偽造 Origin、任意 redirect 與不可信 proxy headers 被拒絕。

驗證：Fastify HTTP integration test（包含 webhook 原始 body 轉送）與跨來源瀏覽器測試。相依：T00、T01。範圍：M。

檔案：`apps/auth-server/src/index.ts`、`apps/auth-server/package.json`、HTTP 測試與測試設定。

### T09b：明確配置 auth factory

- [x] 明確傳入 secret，核對 DB/env 注入與 server/client basePath，移除 factory 仰賴其他全域環境的隱性設定。
- [x] 允許主機、trusted origins 與代理標頭由明確配置決定；移除無條件的跨專案 wildcard。
- [ ] 檢查 account linking、server-only additional fields 與 passkey origin/RP ID；不以關閉安全檢查解決相容問題。

驗證：不同 basePath、惡意 Host、未信任 forwarded headers、錯誤 origin、兩個 auth instance 的配置隔離。相依：T08、T09a。範圍：M。

檔案：`auth/src/auth.ts`、`auth/src/client.ts`、`auth/src/env.ts`、`auth/src/db/db.ts`、配置測試。

## T10：全面遷移官方 Email Service 與密碼復原

### T10a：以官方 sender 取代 Mailtrap

- [x] 使用 `@better-auth/infra` 的 sender 與 server-only API key；刪除 Mailtrap client/env、console 寄信及無用途的 axios 依賴，不保留舊 provider fallback。
- [x] 驗證、reset、change-email、organization invitation callbacks 全部使用官方模板；核對收件人、URL、期限與每 app 名稱/回跳資料。
- [ ] 配置必要官方方案與背景工作 lifecycle；測試 `success: false`、例外與工作完成，避免 token log、假送達訊息及 serverless 中斷寄信。

驗證：四種 callback 契約與背景寄送測試；配置缺失明確失敗、generation/test 不寄信。相依：T01、T09。範圍：M，必要時將 env/依賴清理與 callback 整合分步。

檔案：`auth/src/auth.ts`、`auth/src/lib/email.ts`、`auth/src/env.ts`、`auth/package.json`、郵件測試；消費端 fixture/env 文件在 T16 同步更新。

### T10b：接通密碼復原 UI

- [x] 使用 T10a 的官方寄信 callbacks；UI 區分請求受理與實際送達，公開 reset 回應不洩漏帳號是否存在。
- [x] login form 忘記密碼呼叫官方 reset request；依已登錄 app 的設定選擇回跳，邀請與驗證信同樣保留正確 app 上下文；沒有設定時顯示不可用。
- [ ] 加入可消費 reset token 的流程並更新示例消費端，測試過期、已使用與無效 token；不提供假成功頁。

驗證：測試 reset handler 與表單；官方 Email Service 另以已配置測試信箱做寄達 smoke test。相依：T10a。範圍：分 UI request、reset consumer 兩個 S/M 步驟。

檔案：`auth/src/auth.ts`、`auth/src/lib/email.ts`、`auth/src/env.ts`；`auth-ui/src/login-form/`；新增 reset 表單與 notion-clone 對應頁面；各步各自補測試。

## T11：修正密碼狀態與不支援操作

- [x] 從官方帳號資料推導 hasPassword，移除固定 true。
- [x] 社群使用者以官方支援的密碼建立/復原方式操作，不以 client 直通 server-only setPassword。
- [x] 未提供的敏感 adapter 方法停用 UI 或回報明確錯誤；不得 no-op 後顯示密碼設定成功。

驗證：credential/social-only 使用者與缺少 adapter 能力三種案例。相依：T04、T10。範圍：M。

檔案：`use-account-adapter.ts`、`settings-panel/src/lib/types.ts`、`use-account-actions.ts`、`account/security-section.tsx`、測試。

## T12：正確處理 2FA 登入 challenge

- [x] 已啟用 2FA 的帳號登入進入官方 challenge 流程，驗證前不觸發一般登入成功。
- [x] 支援既有 plugin 的 TOTP/backup-code 登入驗證及錯誤處理；不自行建立 challenge/token 協定。
- [x] enrollment/SMS 尚未完成的 UI 明確維持不可用；若使用新版 enable 回應，按 method 辨識型別。

驗證：既有 2FA 帳號、錯誤代碼、過期 challenge、backup code 重用與正常未啟用帳號。相依：T09。範圍：M。

檔案：`auth/src/client.ts`、`auth-ui/src/login-form/`、新增 challenge 元件與測試、必要的 consumer redirect 配置。

## T13：整理 Stripe 整合

### T13a：升級 plugin 與 Node SDK

- [x] 與 T01 同批確認 `@better-auth/stripe` 的 published peer range，升級至相容正式版及 `stripe` 22.x 正式版；更新 catalog/lockfile，不依賴忽略 peer 錯誤。
- [x] 核對 v21/v22 變更、預設 API version 與 webhook event version，記錄正式 webhook 設定需另行處理的差異。官方驗章不重測，HTTP 層保留原始 body 轉送測試。
- [ ] 檢查 Stripe.js/React Stripe.js 的 peer 相容與 Elements；只在有需求時升級，保留內嵌表單並跑回歸測試。

驗證：auth、settings-panel、Storybook 型別與帳務測試；測試模式 subscription 更新、取消及事件重送。相依：T01 的版本盤點；在 T02 產生新版 schema 前完成版本選定與安裝。範圍：M。

檔案：`pnpm-workspace.yaml`、`packages/auth/package.json`、Stripe client 設定與帳務測試；`pnpm-lock.yaml` 為 generated change。

### T13b：保留必要帳務資料整合

- [x] 訂閱與 billing portal 使用官方流程，核對 organization 設定與 authorizeReference，支援合法角色判斷。
- [x] 保留設定面板必要的 customer 顯示/表單組合操作，每個保留 endpoint 驗證組織與帳務權限；不為刪除 endpoint 強制改成 portal UI。
- [x] 所有操作傳遞 API 失敗；未配置 Stripe 時能力明確停用，不以 catch 改成 free plan。

驗證：owner/admin/member/外部組織的權限矩陣、API 拒絕、未配置 Stripe；test-mode portal/webhook smoke test。相依：T05、T09、T13a。範圍：M。

檔案：`stripe-extra.ts`、`auth/src/db/actions.ts`、`use-billing-adapter.ts`、`use-billing-actions.ts`、測試。

### T13c：將方案與回跳位置改成服務配置

- [ ] 移除 placeholder price ID，按 T00 的共用/每 app 帳務契約配置有效方案，client 不可任意指定 price ID。
- [x] billing return/success/cancel URL 來自該 app 的允許設定，不寫死單一 `/settings/billing`。
- [x] 不同 app 的方案與訂閱 reference 依契約取得授權，不能用 app ID 或 Origin 取代使用者及組織授權。

驗證：兩 app 的 checkout/portal 回跳、未配置 price 的明確錯誤與跨 app 越權測試。相依：T00、T13b。範圍：M。

檔案：`auth/src/lib/plans.ts`、`auth/src/auth.ts`、`auth/src/env.ts`、`use-billing-adapter.ts`、測試。

## T14：修正保留的檔案與 emoji 擴充

- [x] 依 organization/resource 驗證讀寫權限，使用 session 使用者而非 client 宣告身分。
- [x] 以 Zod 約束 MIME、用途、名稱與 payload 大小；不接受未知 MIME 後默認 PNG。
- [x] storage 或 DB 失敗不回報成功，避免未授權上傳、跨組織刪除與路徑濫用。

驗證：跨組織、無權限、過大/不合法 payload、storage failure 與正常操作測試。相依：T09。範圍：M。

檔案：`emoji.ts`、`file-upload.ts`、共用授權/驗證模組與測試。

## T15：完成 adapter 與設定畫面稽核

- [x] 修正 passkey `return !result`，區分成功、取消與失敗；檢查 sessions、emoji、upload 等剩餘 adapter 的錯誤傳遞。
- [x] 檢查 auth 相關 mutations 的 optimistic update、部分失敗與快取失效；未配置能力不顯示可成功執行的控制項。
- [x] 外部 metadata、圖示與角色以 schema 驗證；保留顯示空值處理，移除舊格式相容判斷與 unsafe 權限轉型。

驗證：以每個修正行為的 focused test 覆蓋成功與失敗，再執行 settings-panel 現有測試。相依：T04–T14。範圍：依 passkey/session、emoji/upload、設定 UI 拆成 S/M 步驟。

檔案：`auth-ui/src/adapters/` 與 `settings-panel/src/presets/` 中實際發現問題的檔案；各步限約五個手寫檔案。

### 檢查點 C

- [ ] 所有已公開操作有真實結果與錯誤處理；新增的安全限制具備正反向測試，無 legacy API/schema fallback。

## T16：驗證消費端並交付升級說明

已完成三套件與 auth-server 檢查、notion-clone typecheck/lint/production build、e2e import 19 tests，及 Storybook mock 瀏覽器畫面與分頁操作確認。Storybook Vitest addon 未能開始執行測試；兩個真實 app、同源 proxy 與外部整合仍未驗收，因此以下複合驗證項目保留未勾選。

### T16a：刪除全 repo 不再使用的 function 與 exports

- [ ] 追蹤全 repo 實際入口與引用，包括間接 re-export、動態載入、框架/config、MDX、registry 及公開 API 契約；找出整串無實際消費端的 helper，不只搜尋單一名稱。
- [ ] 刪除確認無用途的 function、type/value exports、barrels、endpoint/client plugin、檔案與依賴；同步清理消費端、文件與專屬測試，不保留相容 alias。
- [ ] 每批刪除檢查 diff，執行所屬套件與受影響消費端的適當驗證；最後重掃，記錄必要入口或公開 API 的保留理由。

驗證：無懸空 import/export、package entry、registry 或文件引用；相關 typecheck/lint/build/test 通過。沿用現有工具，僅在引用判定不足時補充分析，不為清理建立長期新平台。相依：T04–T15；各任務過程中先同步清理，最後再全面掃描。範圍：依套件分成 S/M 批次。

檔案：指定範圍內確認未使用的宣告及其 exports、依賴與引用；不限定三個 auth 相關套件，但排除 apps/globe 與 apps/map-server。

### T16b：整合驗證與文件

- [ ] 刪除無引用的 endpoints、client plugins、欄位與依賴；逐檔記錄三個套件的審查結果與保留理由。（主要清理與逐功能紀錄完成；最後引用/產物重掃待整合。）
- [ ] 執行三套件與 auth-server/受影響消費端的 typecheck/lint/build/format/test；驗證兩個 app 及同源 proxy 接入，Storybook 與真實 auth-server 結果分開記錄。
- [x] 交付新版 schema 與 app 接入、部署設定說明，標明未能實測的 OAuth、郵件、WebAuthn、Stripe 項目；diff 不含本機設定或秘密。

驗證：plan.md 的驗證矩陣、schema 核對與最終 diff review。相依：T00–T15、T16a。範圍：依 consumer 修正與文件分批，每批約五個檔案；驗證本身不限制讀取檔案數。

檔案：受影響的 `apps/auth-server`、`examples/notion-clone`、`apps/e2e`、registry/Storybook/docs；新增 auth 升級說明與審查紀錄。

### 最終驗收

- [ ] 全 repo 已完成 unused function/exports 掃描與清理；沒有無用途 wrapper、deprecated alias 或為假設中的未來需求新增的抽象。
- [x] 最新正式版與 plugins 相容，最終 schema 與型別驗證通過。
- [x] 每個自訂功能已標記「改用官方／必要資料組合或擴充／移除未使用」，settings-panel 欄位與功能未因刪除端點而退化。
- [ ] 新 app 可依接入文件完成配置，不修改 auth 核心；Stripe plugin/SDK/API/webhook 的相容性已驗證。
- [ ] 使用者可完成既有認證與設定流程，權限和 API 錯誤不會變成 owner、空成功或假完成。
- [x] 應用程式只使用新版路徑；本次只更新 schema，沒有資料 migration 或演練。
