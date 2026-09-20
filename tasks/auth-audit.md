# 認證升級審查紀錄

日期：2026-09-20。此文件記錄本次實作決策與驗證邊界，不取代 [plan.md](./plan.md) 或 [todo.md](./todo.md) 的交付清單。服務操作見 [auth-server 接入說明](../apps/auth-server/README.md)，設定與 API 契約見 [auth 套件參考](../packages/auth/README.md)。

## 版本與資料範圍

選定 Better Auth、passkey、Stripe plugin 1.7.5，Infrastructure 0.4.9，以及 Stripe Node SDK 22.6.2。Zod workspace catalog 改為 4.6.5，符合 Better Auth 的 ^4.5.4 peer 要求。Stripe 瀏覽器套件保留現有相容版本範圍。Node SDK 的預設 API version 為 `2026-08-26.dahlia`；webhook destination 的 event version 必須獨立核對，不隨套件升級自動改變。

本次沿用共用 user 與 organization 模型。沒有新增 appId、app registry、OAuth provider、SAML、SCIM、SMS 或 enrollment 功能。`APP_URL` 是沒有受信任 Origin 時的預設 consumer，其他 consumer 由 `TRUSTED_ORIGINS` 列出。邀請頁面統一使用 `/accept-invitation/{id}`。

使用者已確認資料庫為空。變更更新最終 schema 與 generator entrypoint，不建立或執行 migration、baseline、回填、`db:push` 或遠端資料操作。

## 逐功能決策

| 功能                 | `auth` 決策                                                                                                   | `auth-ui` 決策                                                                                | `settings-panel` 契約                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 帳號與密碼           | 保留官方帳號、驗證、變更及重設 API；不新增 server-only setPassword 的公開替代端點。                           | 從 `listAccounts` 的 credential 帳號推導 hasPassword；忘記密碼使用官方 requestPasswordReset。 | 缺少 setPassword 能力時停用入口；密碼狀態來自 API 刷新，不樂觀宣稱已有密碼。 |
| Email                | 改用官方 Infrastructure sender 與四種模板；移除 Mailtrap、console token 輸出與替代寄信 fallback。             | 傳入 consumer 的 reset callback；受理不代表寄達。                                             | 保留既有 email 設定入口，無 adapter 時不可假成功。                           |
| Session              | 保留官方 IP、userAgent 與 revoke API；初始工作區只由 create.before 決定。                                     | 由 userAgent 解析裝置顯示。                                                                   | 保留裝置、最後活動及撤銷 UI。位置欄位改顯示 IP。                             |
| 地理定位             | 移除每次 session 更新的外部 HTTP 定位與二次 DB update，也移除儲存的 location。                                | 不假造城市或外部定位結果。                                                                    | 城市顯示不再提供。這是本次功能取捨，並非官方具備等價定位服務。               |
| 工作區 slug          | 移除 getUniqueSlug；唯一性由官方建立流程判定。                                                                | 產生 slug 字串並呼叫官方 checkSlug；建立失敗保持錯誤。                                        | 保留建立與切換工作區流程。                                                   |
| 工作區詳細資料       | 保留精簡且有 membership 授權的 getWorkspaceDetail；移除 owner fallback。只有明確停用 billing 才略過訂閱查詢。 | 解析顯示資料並傳遞錯誤。                                                                      | 保留名稱、圖示、slug、角色與方案；沒有有效邀請連結時隱藏控制項。             |
| 組織成員             | 使用官方成員讀取與異動。                                                                                      | 成員資料需完整處理官方分頁，角色不得默認 owner；接受官方逗號多角色。                          | 保留使用者資料、member ID、組織角色與團隊對應。                              |
| Teamspace 列表       | 保留授權後的 listTeamsWithMembers 批次查詢，避免逐團隊讀取。移除未使用 listTeamMembers。                      | 解析 icon、permission 與 owner/member 角色。                                                  | 保留 icon、visibility、ownedBy、時間與所有成員角色。                         |
| Teamspace membership | 移除 addTeamMemberWithRole 的直接 insert；官方 addTeamMember 維護 membershipKey 與 memberCount。              | 使用官方新增與移除；需要 owner 時另更新產品角色。                                             | membership 與角色錯誤不可回報成功。                                          |
| Teamspace 角色       | 保留 updateTeamMember 擴充，限定 owner/member；檢查 caller 的官方 team:update 與 target 所屬組織、團隊。      | 角色與組織 admin 分開處理。                                                                   | owner/member 是產品角色，不自動授予組織管理權。                              |
| 邀請                 | 官方 API 管理建立、取消、接受與驗證。保留 listInvitationsWithInviter 顯示補充。                               | API 失敗傳遞至 UI；接受後的 active workspace 必須一致。                                       | 保留 inviter 姓名、email、avatar，以及取消或拒絕狀態。                       |
| 帳號連結             | 使用官方 account selector 與 unlink 保護。                                                                    | accountInfo、unlink 使用本地 account row ID；credential 不查 provider profile。               | 保留 provider 顯示與選定帳號解除連結。                                       |
| Passkey              | 使用官方 plugin。                                                                                             | 檢查 `{ data, error }`，不能把失敗當作新增成功。                                              | 缺少能力停用入口；新增失敗設定 modal error；更新與刪除失敗回復資料。         |
| 2FA                  | 保留官方 plugin 與既有啟用帳號的 challenge。                                                                  | challenge 不能觸發登入成功；驗證後才導頁。                                                    | 未完成 enrollment 與 SMS 的入口維持不可用。                                  |
| Stripe 訂閱          | 使用官方 subscription 與 billing portal；方案與真實 price ID 由 server 設定。                                 | 明確使用 billingReturnURL；SDK 或 endpoint 錯誤向上傳遞。                                     | 保留方案與付款方式導頁。                                                     |
| Stripe customer      | 保留授權的 customer 讀取與更新擴充。官方 portal 不能取代 customer 資料 API。                                  | 保留內嵌地址與 email 表單資料組合。                                                           | 不為刪除 endpoint 強制移除內嵌表單。                                         |
| Emoji 與上傳         | 保留 storage endpoint，補資源授權、MIME、base64、大小與路徑驗證。                                             | avatar 使用 session 身分；workspace-icon 明確帶 organizationId；檢查回傳錯誤。                | 保留 emoji 與圖示 UI。                                                       |
| Additional fields    | 保留偏好、icon、permission；ownedBy 由 server hook 決定，teamMember.role 不能由 client 直接輸入。             | 對外部 icon 與 enum 資料做 schema 驗證。                                                      | 保留產品資料欄位。                                                           |
| Optional adapter     | 正式 server 沒有 mock 或成功 fallback。                                                                       | 未配置的能力可明確不提供 adapter。                                                            | mutation 缺少能力時拒絕操作；獨立 Storybook mock adapters 保留。             |

## 顯示與請求契約

以下計數指每次資料載入的前端 HTTP 請求，不包括 session 狀態初始化。授權查詢計入 server 工作，不能因減少 query 數省略。

| 資料        | 必要欄位                                                                                  | 請求與完整性                                                                    |
| ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Account     | id、name、email、avatar、preferredName、hasPassword、language、timezone、currentSessionId | 並行呼叫官方 listAccounts 與停用 cookie cache 的 getSession 資料。              |
| Workspace   | id、name、slug、logo、caller roles、plan                                                  | 一次 getWorkspaceDetail；伺服器完成會員檢查及必要訂閱組合。                     |
| People      | member ID、user ID、name、email、avatar、organization role                                | 官方分頁必須讀至 total；不能只保留預設第一頁。                                  |
| Teamspaces  | id、name、icon、permission、ownedBy、時間、userId/role 陣列                               | 一次 listTeamsWithMembers；一個關聯批次 DB query，沒有逐團隊 N+1。              |
| Invitations | id、email、role、status、inviter id/name/email/avatar                                     | 一次 listInvitationsWithInviter；直接查 user 關聯，邀請者離開組織不會遺失顯示。 |
| Billing     | paymentMethod、billedTo、billingEmail、upcomingInvoice                                    | 官方 subscription list 與授權 customer endpoint 各一次，可並行。                |
| Sessions    | id、token、device、type、lastActive、IP display                                           | 一次官方 listSessions；裝置解析在 UI，不增加定位 HTTP request。                 |
| Connections | 本地 account ID、provider ID、provider-side account ID、scopes、profile                   | 一次 listAccounts，再對每個非 credential 帳號各查一次 profile。                 |

## 傳輸與節流補充

採用官方 database rateLimit storage，最終 schema 包含 rate_limit table。Fastify 依 socket 及 TRUSTED_PROXY_IPS allowlist 計算 request.ip，覆寫 x-auth-client-ip；Better Auth 只讀取此 header。未配置可信代理時，不接受 caller 自報的 forwarded IP。正式環境仍須確認代理鏈與限流行為。

HTTP body limit 為 7 MiB，讓 5 MiB decoded image 的 base64 與 JSON 可以抵達 plugin 驗證。plugin 的影像大小、MIME 與用途限制維持有效。

## 清理與保留邊界

刪除的 auth 路徑包含 getUniqueSlug、未使用 listTeamMembers、直接新增 membership 的 addTeamMemberWithRole、舊 session 更新 helper、Mailtrap、placeholder paid plans，以及未接入的 additionalTeamMemberFields 宣告。產品角色改為 plugin schema 的受保護欄位。移除沒有實際接受端點的 inviteToken/resetLink 產生流程；正式 adapter 沒有 inviteLink 時隱藏該 UI，官方 email invitation 流程保留。

notion-clone 移除自身 auth route、server auth instance 與 server env 依賴，只連到共用服務。settings-panel 移除沒有任何入口的 deprecated PublicSection。Storybook 使用的 mock adapters、產品型別、必要 barrel 與公開入口保留；沒有因單一檔案缺少 import 就刪除公共契約。

`apps/globe` 與 `apps/map-server` 不在本次範圍，未納入清理。auth-server 使用官方 `/api/auth/ok`，不保留自訂 health endpoint。

其他全 repo 清理包含未引用的 getFilePath、CheckboxCellEditor、restrictEnvAccess，以及僅內部使用的 export。各項刪除仍須由整合 typecheck 與實際入口檢查確認。

## 自動驗證範圍

- `organization-extra.test.ts` 透過真實 Better Auth HTTP handler 與 memory adapter 驗證跨組織讀取、角色授權、enum、明確 billing 停用、訂閱錯誤，以及官方 memberCount 與預設角色。
- `resource-authorization.test.ts` 驗證資源所屬組織、管理權限、上傳格式與大小、storage 路徑及外部失敗。
- `auth.test.ts` 驗證注入設定、官方 email callback 收件者與拒絕寄信結果。
- `stripe-webhook.test.ts` 的兩個 fixture 測試驗證有效簽章、重送及竄改 payload 拒絕；不涉及 Stripe 網路或 Dashboard 設定。
- auth-ui tests 驗證帳號與 passkey 錯誤、裝置解析、local account ID、登入 challenge 與 reset-token UI。
- settings-panel tests 驗證缺少能力不成功、密碼資料刷新、passkey modal error 與停用入口。
- Fastify tests 包含官方 /ok、覆寫偽造 client IP、影像 body 上限，以及不同 origins、preflight、原始 body、cookies、redirect、status，以及忽略未受信任的 Host 與 forwarded host。

**尚未執行真實 PostgreSQL、寄信、OAuth、WebAuthn、Stripe 或跨站瀏覽器整合測試。**

memory adapter 與假的外部服務回應不證明 PostgreSQL、OAuth provider、Stripe、Supabase 或正式信箱已整合成功。測試通過數量與最終 package checks 以本次交付的實際執行結果為準。

本機驗證快照：auth 63 tests、auth-ui 43 tests、settings-panel 14 tests，各套件 typecheck/lint/build 通過。auth-server 14 tests 與 typecheck/lint/build、e2e import 19 tests 已通過。schema generation 在最終 Drizzle 0.45.2 下仍與原檔 SHA1 一致，沒有 DB 操作。notion-clone 最終 typecheck、lint、Next production build 通過。Storybook 透過瀏覽器確認 Login 表單、Forgot password 入口、Settings Account/People/Billing 渲染與分頁切換；使用 mock，未驗證真實 auth。Storybook Vitest addon 仍在測試執行前因 Rsbuild preset/Vite alias JSX 設定失敗，不能列為 tests 通過。 **真實 PostgreSQL、寄信、OAuth、WebAuthn、Stripe 與跨站瀏覽器測試尚未執行。**

整合提交為 `543f12c2`，前序提交為 `c070a7ae`、`833edd8e`、`5aa44468`。上述 auth 相關套件、server 與 import tests 合計 153 tests 通過，不代表整個 repository 全部測試通過。先前 table-view 全套測試有 timeline selection、sort remove 兩個 timeout；當時也曾因磁碟不足導致 build/docs build 失敗。後續 table-view build 已成功，但全套測試未重跑，docs production build 尚未完成。

後續測試精簡：移除設定值照抄斷言、重複的 URL 轉換與上傳失敗案例，以及直接測試第三方內部背景工作方法的案例，共 6 個；同步刪除不再使用的 mock。重新執行 auth 61 tests、auth-ui 39 tests，全部通過。權限、安全邊界與重要流程回歸測試保留。

## 尚需部署或現場驗證

| 驗證              | 尚未由本機契約測試證明的部分                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 兩個真實 consumer | 各自完成註冊、登入、登出、session、邀請與 reset 回跳；另一分頁切換 active organization 後操作仍指向指定資源。                                    |
| Cookie 與 proxy   | 同父網域、無關網域、第三方 cookie 限制、HTTPS 與實際 reverse proxy。CORS allowlist 不保證跨站登入。現有 factory 沒有通用跨域 SSO 或 proxy 實作。 |
| OAuth 與 passkey  | Google/GitHub callback 白名單、部署的 passkey RP ID 與 origin，以及實體驗證器的建立和撤銷。                                                      |
| Email             | Infrastructure Pro+、有效 API key、實際寄達、舊新信箱流程、背景 task 完成與平台錯誤記錄。不能把 reset 受理當作寄達。                             |
| Stripe            | 真實 test-mode price、customer、subscription、付款方式、webhook 簽章、重送，以及 Dashboard event version 與 `2026-08-26.dahlia` 的相容性。       |
| Storage           | 部署 bucket policies、upload/delete 成功與拒絕行為；publishable key 不自行授予寫入權。                                                           |
| PostgreSQL        | 最終 schema 在真實 DB 的 constraints/relations 及整合行為；generator 重現已完成。沒有執行遠端 schema 操作。                                      |
| 異常與競爭        | slug 同時建立、member 分頁完整性、批次成員部分失敗、邀請過期/取消/錯誤 email/未驗證 email 的完整 UI 回歸。                                       |

官方依據：[Better Auth Email Service](https://better-auth.com/docs/infrastructure/services/email)、[Better Auth cookies](https://better-auth.com/docs/concepts/cookies)、[Stripe API upgrades](https://docs.stripe.com/upgrades)。上表保留的產品資料組合與地理定位取捨屬本專案決策。

Avatar 上傳以 `avatar` / `workspace-icon` discriminated union 區分用途。個人頭像使用 session user ID 路徑，無工作區也可操作；工作區圖示仍要求組織寫入權限。上傳成功後分別更新官方 user image / organization logo，並只 invalidate 對應設定快取。account.getAll 並行讀取官方 fresh session 與帳號列表，避免 session hook 尚未刷新時重用舊頭像。

Browser imports 使用 `@notion-kit/auth/client`；根入口保留 server factory，避免把 PostgreSQL/TLS 相依帶入瀏覽器。notion-clone dev/start 使用 3002，auth server 使用 3001。已安裝 Drizzle 0.45.2，Better Auth/Stripe/Drizzle peer 相容；既有 TS 6/Vite 工具鏈警告仍需另行處理。
