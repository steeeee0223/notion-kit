# Better Auth 升級與官方功能遷移計畫

日期：2026-09-20。狀態：核心實作、文件與套件/consumer 檢查已完成；外部服務與跨站瀏覽器驗證尚未執行。工作清單見 [todo.md](./todo.md)。

## 目前實作狀態

已選定 Better Auth/passkey/Stripe plugin 1.7.5、Infrastructure 0.4.9、Stripe Node SDK 22.6.2，以及符合 peer 要求的 Zod 4.6.5。auth/auth-ui/settings-panel 已切換新版 API 與錯誤處理；共用 Fastify server、最終 schema、官方寄信、reset-token UI、既有 2FA challenge 與接入文件均已有實作。settings-panel 修正已提交為 `5aa44468`。

本機驗證快照：auth 63 tests、auth-ui 43 tests、settings-panel 14 tests，各套件 typecheck/lint/build 通過。auth-server 14 tests 與 typecheck/lint/build、e2e import 19 tests 已通過。schema generation 在最終 Drizzle 0.45.2 下仍與原檔 SHA1 一致，沒有 DB 操作。notion-clone 最終 typecheck、lint、Next production build 通過。Storybook 透過瀏覽器確認 Login 表單、Forgot password 入口、Settings Account/People/Billing 渲染與分頁切換；使用 mock，未驗證真實 auth。Storybook Vitest addon 仍在測試執行前因 Rsbuild preset/Vite alias JSX 設定失敗，不能列為 tests 通過。 table-view build 已通過，但先前全套測試兩個 timeout 尚未重跑；docs production build 尚未完成。這些結果不代表整個 repository 全部檢查通過。 **真實 PostgreSQL、寄信、OAuth、WebAuthn、Stripe 與跨站瀏覽器測試尚未執行。**

詳細功能決策、資料請求契約與外部驗證缺口見 [auth-audit.md](./auth-audit.md)。[todo.md](./todo.md) 僅勾選已有實作證據的項目；包含尚未完成驗證的複合項目保持未勾選。

本次已確認的調整如下：

- `apps/globe` 與 `apps/map-server` 排除於範圍之外。
- auth-server 使用官方 `/api/auth/ok`，移除自訂 health endpoint。
- 使用官方 database rateLimit，schema 增加 `rate_limit`。Fastify 覆寫 `x-auth-client-ip`，只信任 `TRUSTED_PROXY_IPS` 列出的代理；HTTP body limit 7 MiB 容納 plugin 的 5 MiB decoded image。
- 移除 session 外部地理定位 HTTP 服務與儲存欄位；UI 由 userAgent 解析裝置，位置欄位顯示 IP，不再提供城市。
- 移除沒有接收端點的 inviteToken/resetLink；正式 adapter 未提供 inviteLink 時隱藏 UI，保留官方 email invitation。
- 組織多角色接受官方逗號格式，teamspace owner/member 仍是獨立產品角色。
- notion-clone 僅連線共用 auth-server，不保留自己的 auth route。consumer 明確配置 resetPasswordURL 與 billingReturnURL，邀請共用 `/accept-invitation/{id}`；沒有 app registry。

## 目標與範圍

本次從 Better Auth 1.6.11 升級至 [1.7.5](https://github.com/better-auth/better-auth/releases/tag/v1.7.5)，同步升級直接使用的官方套件。Infrastructure 使用獨立版本 0.4.9。最終安裝與 lockfile 檢查通過；Better Auth/Stripe/Drizzle 無 peer 衝突，既有 TS 6/Vite 工具鏈警告另行追蹤。

完整審查 `packages/auth`、`packages/auth-ui` 與 `packages/settings-panel` 的認證相關用法。官方已有等價功能就移除重複實作，包含 API、client plugin、型別、schema 與無用依賴。官方提供基本操作不代表回傳資料足以支援設定面板：有必要的資料組合、批次查詢與顯示欄位仍可保留為有授權的自訂 endpoint。

這次交付包含最新版 DB schema、官方 API 切換、確認問題的修正、回歸測試與升級說明。`apps/auth-server` 是供未來多個 app 接入的獨立服務，也是本次核心範圍；不能只當成 notion-clone 的後端。其他消費端調整受影響的整合，不擴增未啟用的 SAML、SCIM 或 SMS。

## 遷移原則

1. 每個功能只保留新版實作。不做舊 endpoint 重試、雙 schema 讀寫、舊欄位回退或 catch 後假裝成功。
2. 使用者已確認目前 DB 全部為空；直接更新最終 schema，不建立或執行資料 migration、baseline、回填及演練。
3. 官方 API 管理 session、帳號、組織及團隊 membership。不直接寫入官方內部資料來繞過驗證、容量限制或 hooks。
4. 不把組織角色與 teamspace 角色視為同一概念。無官方等價功能時，保留產品語意。
5. 顯示用空值、明確關閉的 optional plugin，以及獨立 mock adapter 不等於 legacy fallback。但正式 adapter 缺少能力或 API 失敗時，不得回報操作成功。
6. schema 產生結果必須能重現；不得覆蓋掉 emoji、teamspace 欄位等產品資料。
7. 沿用專案現有 pnpm、TypeScript、Vitest 宣告。工具環境依 AGENTS.md 執行，不將個人路徑、store 或機器設定寫入 repository。
8. 先以 settings-panel 的欄位、角色、分頁、錯誤與請求數建立契約，再決定 endpoint 去留。優先使用官方 API；若需直接讀取 DB 補足關聯資料，先做官方權限或明確資源授權。呼叫 server API 時保留使用者上下文，不能因省略 headers 意外繞過權限。

## 最小實作與全 repo 清理

以達成已確認需求的最少程式與配置為準。直接使用官方功能及現有 repository 工具，不另建通用 auth framework、provider registry、動態 app 註冊平台、郵件佇列系統或只轉送參數的 wrapper。只有多處確實共用的邏輯才抽取 helper；單一用途邏輯就近放置。

多 app 接入優先沿用官方 trustedOrigins、callback URL 與少量 server 配置；僅在實際流程需要時增加 app 對應資訊。沒有明確需求就不新增 appId DB 欄位、app tenant、每 app 的權限平台或獨立計費系統。背景寄信用部署平台與官方現有能力，不自建排程/重試服務。驗證兩個來源可用現有 app 和測試 fixture，不為驗證再建立完整 app。

全 repo 掃描不再使用的 function、type/value exports、barrel re-exports、endpoint/client plugin 與相關依賴，並刪除確認無用途者。每個功能替換時同步清理，最後再做完整檢查，不留下 deprecated alias、相容 wrapper 或「未來可能用到」的程式。

判定 unused 必須從實際入口追蹤引用：涵蓋 apps、examples、packages、tooling、測試、Storybook、docs/MDX、registry、package exports、CLI/config 及動態載入。被另一個無人使用的 helper 引用仍屬可刪除；僅經 barrel re-export 不算實際用途。框架入口與刻意提供的公開 API 則依其契約確認，不能因沒有靜態 import 就誤刪。

刪除實作時同步更新 imports、barrels、package exports、registry 產物來源、文件與專屬測試；無其他使用者的依賴才從對應 manifest/catalog 移除。保留仍有用途的安全檢查、資料組合端點與行為測試，不以行數最少取代必要正確性。清理不延伸成無關功能的重設計。

## 官方能力與現有實作對照

下表結合官方文件與目前程式碼。標示「待核對」的項目必須由目標版本的型別、原始碼與契約測試確認，不能靠型別斷言補足。

| 現有功能                                       | 遷移決策                                                                                                                                                                                                                           | 主要位置                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Session 的 IP 與 user agent                    | 使用官方 `ipAddress`、`userAgent` 與 IP/proxy 設定。現有程式已從這兩個官方欄位讀值，並未自行取得 IP。                                                                                                                              | `auth/src/db/actions.ts`、`auth/src/auth.ts`             |
| `deviceVendor`、`deviceModel`、`deviceType`    | 官方 session 文件未提供等價的裝置解析欄位。規劃改在 UI adapter 由 `userAgent` 產生顯示資料，移除伺服器重複儲存及更新；最終 schema 移除可重新推導的欄位。                                                                           | `auth/src/lib/utils.ts`、`auth-ui/src/adapters/utils.ts` |
| IP 地理位置                                    | 尚未找到官方等價功能。實作決策改為移除外部定位與儲存欄位，裝置列表顯示官方 IP；城市資訊不再提供。不把這項取捨稱為官方等價替代。                                                                                                    | `auth/src/db/actions.ts`、`settings-panel` 的裝置列表    |
| 初始 active organization                       | 保留選擇初始工作區的產品政策，改用官方建議的 session `create.before` hook。移除 create/update 後直接覆寫 session 的做法；後續切換用 `setActive`。                                                                                  | `auth/src/auth.ts`、`auth/src/db/actions.ts`             |
| `getUniqueSlug`                                | 用官方 `checkSlug` 配合建立組織的唯一性錯誤處理；只保留 slug 字串產生，刪除自訂查詢 endpoint。檢查成功不代表保留 slug，須測試同時建立的競爭情況。                                                                                  | `organization-extra.ts`、`use-create-workspace-form.ts`  |
| `getWorkspaceDetail`                           | 優先組合官方組織資料、成員角色及 subscription API。若集中回傳是設定面板的必要契約，保留精簡整合 endpoint；不強迫每個 app 重做資料組合。移除 owner fallback 與吞掉訂閱錯誤的 catch。                                                | `organization-extra.ts`、`use-workspace-adapter.ts`      |
| `listTeamsWithMembers`、`listTeamMembers`      | 以官方團隊與成員查詢為基礎；保留必要的批次資料端點，避免 UI 逐團隊查詢造成 N+1 或漏頁。確認無引用後才移除自訂 `listTeamMembers`。                                                                                                  | `organization-extra.ts`、`use-teamspaces-adapter.ts`     |
| `addTeamMemberWithRole`                        | membership 建立交由官方 `addTeamMember`，確保新計數及唯一性規則生效；角色寫入只留下官方未涵蓋的擴充。不得先自行 insert 再補計數。                                                                                                  | `organization-extra.ts`、`use-teamspaces-adapter.ts`     |
| Teamspace `owner/member` 與 `updateTeamMember` | 官方文件中的組織角色不是團隊角色的替代品。待核對目標版本的 teamMember 擴充能力；沒有等價 API 時，保留有授權的最小角色擴充。修正目前 additionalTeamMemberFields 宣告後未接入 schema 的不一致。                                      | `auth/src/lib/utils.ts`、`auth/src/db/schemas.ts`        |
| `listInvitationsWithInviter`                   | 邀請生命週期交由官方；優先以官方邀請及成員資料組合顯示。核對邀請者已離開組織、分頁與完整 inviter 資料契約；若官方不提供，僅保留已授權的顯示資料補充，不重寫邀請流程。                                                              | `organization-extra.ts`、`use-invitations-adapter.ts`    |
| 連結帳號                                       | 改用新版 account selector；以本地 account row `id` 操作。略過 credential 帳號的 provider-profile 查詢，保留 provider-side ID 作為不同用途的資料。                                                                                  | `auth-ui/src/adapters/utils.ts`                          |
| Stripe 訂閱、付款方式、帳單                    | 使用官方 subscription 與 billing portal。現有 `stripe-extra` 的 customer 讀取及表單更新未找到完整等價 Better Auth endpoint；只有需要保留內嵌表單或顯示資料的部分才保留授權擴充。不能用 portal 的存在假定它提供 customer 查詢 API。 | `stripe-extra.ts`、`use-billing-adapter.ts`              |
| Emoji 與檔案上傳                               | 屬產品功能，目前未找到官方替代。保留 storage 實作，補組織資源授權、格式與大小驗證，移除無效 MIME 默認為 PNG 的處理。                                                                                                               | `emoji.ts`、`file-upload.ts`                             |
| 偏好、teamspace 圖示與可見性                   | 使用官方 additional fields/hooks 描述產品欄位與驗證。敏感或伺服器推導欄位不可任由 client 寫入。                                                                                                                                    | `auth/src/lib/utils.ts`、`auth/src/client.ts`            |

官方依據：[session 欄位](https://better-auth.com/docs/concepts/session-management)、[組織與團隊 API](https://better-auth.com/docs/plugins/organization)、[Stripe plugin](https://better-auth.com/docs/plugins/stripe)。這些是能力依據；上表的保留與刪除項目是本專案的設計決策。

## 共用 auth-server 的接入契約

服務以穩定的公開 auth origin 與 `/api/auth` 為預設。app 的 origin、回跳位置與業務頁面獨立配置，不能把單一 `APP_URL`、`/settings/billing` 或 `/accept-invitation` 寫死為所有 app 的規則。動態 auth host 僅用於明確配置的 proxy 接入，不把任何 Origin/Host 當成可信配置。

- **接入設定**：優先以官方 trustedOrigins 與已驗證 callback URL 接入；邀請、reset 或品牌資料確實需要時，才增加最小的 app 靜態設定。設定鍵只是識別，不是授權憑證；不以客戶端提交的 URL 決定可信目的地。優先使用官方 callback/state 或 metadata 擴充保存必要上下文，不自製登入 token。
- **HTTP 邊界**：檢查 Fastify 的 CORS、OPTIONS、credentials、body parsing、Set-Cookie、redirect 與錯誤轉送。現有 raw Node handler 包裝須測試 JSON body 及 webhook 原始 bytes，不能重序列化後驗證 Stripe 簽章。參考 [Fastify 官方整合](https://better-auth.com/docs/integrations/fastify)。
- **跨網域**：同父網域 app 與無關網域分別驗證。CORS/trustedOrigins 不會解除第三方 cookie 限制；不同網域優先提供 app 同源 proxy 的接入方式，完整測試公開 callback、cookie domain/path 與 passkey RP ID。proxy 接入可共用帳號資料，但不承諾不同網站自動共用瀏覽器登入狀態。參考 [官方 cookie 指南](https://better-auth.com/docs/concepts/cookies)。
- **信任邊界**：使用者已確認接入者是自己開發的 app，直接向共用 server 發送認證請求，各 app 不再實作 auth endpoint。本次不新增第三方 OAuth/OIDC provider 或 consent 平台；只允許已配置的自有 app。需要同源 proxy 時只做 HTTP 轉送，不重做認證邏輯。接入清單使用靜態配置，不新增動態 client 註冊平台。
- **模組邊界**：核心登入服務不依賴 settings-panel 的 React 型別；顯示資料 endpoint 屬可選擴充。新的 app 可以只接認證，也可按需使用組織、帳務及 settings 資料契約。
- **共用資料語意**：本次沿用現有 user/organization 模型，預設共用身分及組織；仍逐次驗證使用者的 membership/permission。方案及訂閱依實際配置決定共用範圍。`activeOrganizationId` 屬 session 狀態，共用 session 的不同 app/分頁會互相影響；資料操作傳入明確 organizationId，不把它當成穩定的 app 隔離。不要以新增 appId 欄位就假稱完成多租戶隔離。

新增 app 的驗收方式為：只加受驗證的配置與 consumer 整合，即可完成登入、登出、session、郵件回跳及可選帳務流程，不修改核心 auth 業務程式。

## Stripe 升級範圍

| 套件                                           | 現況                       | 計畫                                                                                                                        |
| ---------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@better-auth/stripe`                          | `^1.6.11`                  | 跟 Better Auth 同步升至相容正式版，包含 client plugin；安裝前核對 published peerDependencies。                              |
| `stripe`（Node SDK）                           | catalog `^20.3.1`          | 納入本次升級。最新 Better Auth 文件指定 `^22.0.0`；規劃時 Stripe 官方最新 release 為 22.6.2，安裝前再確認 npm latest。      |
| `@stripe/stripe-js`、`@stripe/react-stripe-js` | catalog `^8.7.0`、`^5.6.0` | 獨立檢查彼此的 peer range、Elements 與 React 19 相容性。Node SDK 升級不代表兩者必須同時升 major；必要升級才納入，記錄判斷。 |

依據：[Better Auth Stripe 安裝要求](https://better-auth.com/docs/plugins/stripe)、[Stripe 22.6.2 release](https://github.com/stripe/stripe-node/releases/tag/v22.6.2)、[Stripe v22 migration guide](https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v22)。已核對安裝的 @better-auth/stripe 1.7.5 manifest：stripe peer range 為 ^18 || ^19 || ^20 || ^21 || ^22；選定 22.6.2 在範圍內。Webhook event version 仍待 Stripe 環境驗證。

SDK 升級另行核對 v21/v22 的破壞性變更、選定 SDK 的預設 API version、customer/subscription 型別與 webhook endpoint 的事件版本。不可只升 package 後假定 Stripe Dashboard 的 webhook version 已同步；本次不自動修改正式 Stripe 帳戶設定。

保留 settings-panel 的必要帳務顯示與內嵌表單，不為刪除 `stripe-extra` 強制改成外部 portal。官方支援的訂閱與 portal 操作直接沿用。方案與 price ID 改為伺服器端配置，移除目前 `price_free` 等 placeholder；確認是共用方案還是每 app 的方案，不能由 client 任意指定 price ID。

## Email 全面採用官方服務

依使用者指定，所有認證郵件統一使用 [Better Auth Email Service](https://better-auth.com/docs/infrastructure/services/email) 的 `@better-auth/infra`，不保留 Mailtrap、其他 provider 或 console 寄信 fallback。選定相容的 infra 正式版本，不假定其版本號與 core 相同。

使用官方 `createEmailSender`，將 server-only `BETTER_AUTH_API_KEY` 與可選的 `BETTER_AUTH_API_URL` 明確注入。部署需配置官方 Infrastructure Pro 或以上方案；未配置時啟動檢查須明確失敗，測試與 schema generation 使用隔離設定且不寄信。

驗證、重設密碼、變更 email 與組織邀請分別使用官方 `verify-email`、`reset-password`、`change-email`、`invitation` 模板。URL/token 與收件人遵循 Better Auth 對應 callback 的安全語意；變更 email 時測試原信箱確認與新信箱驗證，不照抄模板示例而寄錯對象。app 名稱及回跳位置取自已驗證的 app 設定。未啟用的 OTP、magic link、刪除帳號確認不因有模板就自動新增功能；若流程啟用，寄信也只使用同一官方服務。

使用部署平台支援的 background task lifecycle 承接寄信，避免 auth 回應時間洩漏帳號存在與否；不得單純 `void` promise 後讓 serverless 提早結束。檢查官方結果的 `success: false` 與例外，保留不含 token/secret 的可觀測錯誤。前端「請求已受理」不等於郵件已送達，忘記密碼維持不洩漏帳號存在的回應。

刪除 Mailtrap client、`MAILTRAP_API_KEY`、`MAILTRAP_INBOX_ID` 與相關文件/測試。`auth/src/lib/email.ts` 若保留，只做官方模板與背景任務的薄整合；沒有其他用途時移除 auth 的 axios 依賴。驗證四種郵件的模板資料、app 回跳、失敗結果與背景工作完成；實際寄達另以配置好的測試信箱確認。

## 直接更新 DB schema

使用者已確認目前所有 DB 都是空的。本次只更新 repository 的最終 schema 與產生設定，不產生或執行資料 migration，也不進行 baseline、舊資料預檢、回填、遷移演練或回復方案。

`generate` 目前使用舊 CLI，且指向僅匯出 factory 的 `src/auth.ts`。改為目標版官方 CLI 可讀的 auth instance，確保產生 schema 不連線正式 DB、不寄信，也不因 optional plugin 未配置而漏掉必要資料表。

以官方 generator 為依據，直接更新 `packages/auth/src/db/schemas.ts`，納入 team/memberCount、teamMember/membershipKey 及所有啟用 plugin 所需欄位、default、index、unique、外鍵與 relations。保留 PostgreSQL snake_case 命名與必要產品擴充，刪除被官方功能取代的自訂欄位，不留舊版相容 schema。

驗證限於 schema 產生可重現、設定與型別一致，以及使用最終 schema 的功能測試。一般認證及 membership 行為測試照常進行，不額外搭建舊版 DB 或 migration 測試環境。本次不執行 `db:push` 或遠端 DB 結構操作。

## 最佳實務修正範圍

- **授權**：移除重複端點時改由官方端點驗證。保留的角色、帳務與檔案 endpoint 必須驗證呼叫者、資源所屬組織、操作權限與目標成員；前端隱藏按鈕不能取代伺服器檢查。
- **主機與秘密**：將 `env.BETTER_AUTH_SECRET` 明確傳入 factory 的設定；核對 server/client basePath、固定網址及多主機用途。移除預設信任所有 Vercel 專案的 wildcard，從明確配置決定允許主機。只有確認可信反向代理拓撲後才啟用相關 forwarded-header 設定。
- **驗證信與復原**：全部使用上述官方 Email Service，停止 console 輸出含 token 的 URL。忘記密碼必須呼叫官方 reset API 並有 token 消費頁面；背景寄信失敗必須可追蹤，不能宣稱 API 受理等於郵件送達。
- **帳號狀態**：`hasPassword` 從官方帳號資料推導；無密碼使用者走官方支援的設定/重設流程，不把 server-only `setPassword` 暴露成無條件 client endpoint。保留 last-account unlink 的保護，重新評估 `allowDifferentEmails` 的必要性。
- **2FA**：server 已啟用 plugin，登入需正確處理 challenge，不能在 `twoFactorRedirect` 時顯示完成登入。測試既有啟用帳號。尚未可用的 enrollment/SMS UI 維持明確不可用，不為這次升級額外開發 SMS 功能。
- **錯誤與快取**：查核所有 auth-ui adapter 的 `{data,error}`、`throw`、passkey 成功判定、Promise.all 部分失敗與 query invalidation。settings-panel 缺少 adapter 能力時停用操作；不得依 no-op 宣稱密碼、付款或成員異動成功。
- **資料解析**：外部回應、metadata 與圖示 JSON 以 Zod 驗證。角色轉型不可用 `as` 掩蓋權限問題。區分沒有資料、功能未配置及 API 失敗。
- **費用與延遲**：移除每次 session update 的外部 HTTP 查詢與二次 DB update。組合官方 API 時處理分頁，避免每列無界限額外請求。

## 實作順序與檢查點

依 [todo.md](./todo.md) 完成以下階段。每個行為修正先補可重現的失敗測試，再實作。

1. **服務契約（T00）**：確認 app 信任邊界、接入設定與 settings-panel 資料需求，再鎖定遷移範圍。
2. **版本與測試基礎（T01–T03）**：確認版本、建立認證測試環境、修正 generator，完成最終 schema 核對。
3. **官方功能切換（T04–T08）**：帳號 selector、工作區、團隊、邀請與 session 顯示逐一完成從 server 到 UI 的遷移。
4. **安全與真實操作結果（T09–T15）**：共用服務 HTTP 邊界、主機設定、寄信與密碼、2FA challenge、Stripe SDK/帳務、上傳及 settings-panel 行為。
5. **整合交付（T16）**：全 repo 未使用程式清理、至少兩個 app 來源的接入、Storybook、實際 auth-server smoke test、完整驗證與升級說明。

每一階段結束記錄驗證結果及剩餘問題；schema、shared contracts 與 package 升級循序執行，不在共享檔案上同時修改。單一步驟如影響超過約五個手寫檔案，先依功能拆為子步驟；generated lockfile 與 schema 另計。

## 驗證要求

### 自動測試

使用專案既有 Vitest catalog。auth/auth-ui 已有各自 test script 與 Vitest 設定。測試應呼叫真實 Better Auth handler 或真實 adapter 流程；外部郵件、Stripe 及 storage 才以邊界替身隔離。涉及 transaction、unique 或計數的功能案例使用最終 schema 的 PostgreSQL 測試資料，不能只以記憶體 adapter 代替；不做資料遷移測試。

至少涵蓋：舊帳號登入、新註冊、驗證與重設 token、OAuth selector、passkey 結果、session 撤銷、組織切換、跨組織拒絕、團隊重複加入及容量限制、邀請接受、client 錯誤回報、billing 授權與關閉 optional plugins 的行為。

### 套件與消費端

依 AGENTS.md 的 nvm 與 store 規則在允許的執行環境啟動 pnpm。對三個套件執行 `typecheck`、`lint`、`build` 與 `test`；格式使用 `format:fix` 或允許的 `format --write`，不執行裸 `pnpm format`。套件驗證後檢查直接消費端及其受影響的 exports：

- `@notion-kit/auth-server`
- `@notion-kit/notion-clone`
- `@notion-kit/e2e` 的 import 測試及相關瀏覽器案例
- registry、Storybook 與 docs 中受影響的 auth/settings 整合

如命令失敗，先記錄 Node/pnpm/store 與 repository 宣告再診斷，不切換套件管理器。

### 瀏覽器與外部整合

在 Storybook 驗證登入、邀請、passkey、帳號設定及權限 UI，並在 auth-server 的測試環境驗證真實 cookie/session 流程。OAuth callback、WebAuthn origin/RP ID、寄信與 Stripe webhook 另以測試帳號/測試模式驗證。缺少設定時如實記錄未驗證項目；Storybook mock 成功不能替代外部整合驗證。

## 風險與待確認事項

| 項目                                        | 處理方式                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| npm latest 與文件可能不同步                 | 安裝前查 registry、release 及套件 peerDependencies，固定實際選定版本；不採用 RC。                   |
| teamMember 角色未完整登錄官方 schema        | 實作前先驗證目標版擴充契約；不能刪除角色後假設所有人都是 member。                                   |
| optional plugin 造成 schema 產生缺表        | generation config 包含全部需保留的 model，執行時能力另由明確配置決定。                              |
| 地理位置無官方等價功能且目前使用 HTTP       | 保留需求與隔離邊界；供應商的 HTTPS 能力、授權條件與停用預設在 T08 確認，不新增登入阻塞。            |
| 官方 Email Service 需要 Infrastructure 設定 | 配置官方方案與 server API key、核對寄件設定及每 app 的回跳；移除 Mailtrap，不保留「已寄出」假成功。 |
| 多 host 的 passkey/OAuth 有固定 origin 限制 | 以實際部署拓撲測試，不能靠開放 wildcard 解決。                                                      |

app 接入範圍已確認為自有 app 共用 auth endpoints，可依此進行版本與資料契約盤點。實際網域在部署時配置，無關網域的直接 cookie 請求須通過瀏覽器驗證，不能承諾加入 allowlist 就能跨站登入。teamspace 角色與內嵌帳務表單保留。定位依本次確認的取捨改為 IP 顯示；其他未確認的產品功能不擅自刪除。
