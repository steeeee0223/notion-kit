# Table-view edit log 實作計畫

狀態：已完成。已依使用者要求，以 subagents 在目前分支 `feat/update-log` 實作並通過全部驗證；結果見 [todo.md](./todo.md)。

設計依據：[已確認的 spec](../docs/superpowers/specs/2026-09-17-table-view-edit-log-design.md)。
逐項進度與驗收記錄放在 [todo.md](./todo.md)，這份文件記錄順序、責任邊界與驗證方法。

## 目標

提供 table 與 row 兩個可選的 Edit log 入口，共用按需載入的 dialog。
Table log 顯示 action icon 與摘要；row log 使用 API 提供的歷史快照，沿用唯讀 cell 樣式。
清單底部提供手動 **Load more**。Docs demo 與 Storybook 接上靜態 mock API。

## 硬性限制：不改動 table-hook

- 不新增、修改、刪除或移動 `packages/table-hook/` 下的檔案，包含型別、mock、測試、exports 與 build config。
- 不增加 table-hook action、feature、state、callback 或歷史紀錄訂閱。
- Log 型別與 schema 放在 `packages/table-view/src/edit-log/`。
- Mock API 放在 `packages/table-view/src/mock.ts`，經 `@notion-kit/table-view/mock` 匯出。
- 可唯讀使用 table-hook 既有型別與 fixture；不為此修改原 fixture。
- 不實作自動記錄、versioning、undo、redo 或 mutation cancellation。
- 不增加依賴、不變更套件管理器或 lockfile。現有 React、Zod、UI primitives 與 icons 足以完成。

規劃基準 commit 為 `7b779cade4eb02d8516b1e17a9766c1ce967690c`。
此時 table-hook working tree 乾淨，其 Git tree 為
`70093e14954b630272fa9bb3951ee1c35aca30d5`。

每個 checkpoint 與交付前都執行以下檢查；diff 與 status 必須沒有輸出：

```sh
git diff --exit-code 7b779cade4eb02d8516b1e17a9766c1ce967690c -- packages/table-hook/
git status --porcelain=v1 --untracked-files=all -- packages/table-hook/
```

第一個命令涵蓋基準之後的 committed、staged 與目前 tracked 差異；第二個命令另檢查未追蹤檔案。
這些 Git 檢查不涵蓋 ignored build outputs，因此驗證流程也不對 table-hook 執行 build 或產生檔案。
目前已有 table-hook 的 dist 可供相依套件使用。若後續出現問題，先在 table-view 的邊界解決，不能透過改動受保護套件繞過限制。

## 架構與責任

| 單位                                | 責任                                          | 不依賴的資料                                   |
| ----------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `edit-log/types.ts` 與 `schemas.ts` | Fetch contract、歷史快照與回應驗證            | Table mutation actions                         |
| `use-edit-log.ts`                   | 分頁、取消查詢、重試、去重與舊請求隔離        | Table resource state                           |
| `edit-log-provider.tsx`             | 提供穩定的入口能力與開啟方法，協調單一 dialog | Cell 編輯 callback                             |
| `edit-log-dialog.tsx` 與 item 元件  | 清單、狀態、摘要、時間與 Load more            | 當前欄位設定                                   |
| UI plugin 的 `renderReadOnlyValue`  | 使用快照繪製值                                | Live cell、fake row、editor、mutation callback |
| `mock.ts` 與 mock fixtures          | 靜態示例歷史與分頁 fetch                      | Demo 後續操作                                  |

`TableViewWrapper` 接收兩個 fetch props，先取出再將 table options 傳入 `useTableView`。
它在現有 table/plugin context 內提供 edit-log controller，讓完整 TableView 與自訂 wrapper 組合都能使用。
Context 的 capability/open 方法保持穩定；清單與 request state 留在 controller/dialog，不能因載入下一頁而更新 table context。

Dialog 關閉時不保留歷史快取；重新開啟查第一頁。Fetch callback 只在使用者開啟、載入更多或重試時呼叫。
每次請求帶 `AbortSignal` 與 session identity；callback 即使忽略 abort，也不能讓舊結果覆蓋新 dialog。
更換 callback identity 本身不觸發 fetch；後續操作使用最新 callback。

歷史 renderer 透過 optional `renderReadOnlyValue` 接入，舊 custom plugin 不需修改。
未知類型、缺少 renderer、無效 value/config 或 renderer 出錯時使用 API 的 `textValue`。
不能呼叫會對未知類型直接 throw 的 `getUiPlugin` 當成唯一查找路徑。
只縮小實際重用的 value component props，不全面重構目前的 cell renderer。

## 實作順序

依序完成以下工作，詳細 acceptance criteria 見 TODO。本輪依使用者要求，以 subagents 分工並在目前分支整合。

| 階段             | 任務    | 可驗證的結果                                                            |
| ---------------- | ------- | ----------------------------------------------------------------------- |
| Fetch 基礎       | T01–T03 | 可驗證的 API contract、隔離的分頁請求、可操作的 table log dialog        |
| Table 入口       | T04–T06 | 實際 table menu 開啟 dialog；read-only plugin contract 與 fallback 可用 |
| 基礎 cell 樣式   | T07–T08 | Text、title、checkbox、link 快照可唯讀顯示                              |
| 設定型 cell 樣式 | T09–T11 | Select、number、date 使用歷史 config 顯示                               |
| Row 入口         | T12–T14 | Row dialog 接上 action menu，所有既有選單容器都能正確關閉               |
| 隔離與 mock      | T15–T17 | 請求不影響 table 編輯；可從公開 mock subpath 載入分頁 API               |
| Demo 與文件      | T18–T20 | Registry demos、Storybook 與使用說明可展示功能                          |
| 瀏覽器與交付     | T21–T22 | 真實捲動、焦點與選單切換通過驗證，table-hook 零變更                     |

主要依賴順序為 T01 → T02 → T03 → T04 → T05。
T06 提供 T07–T11 的 renderer contract；T12 匯整 renderer，T13–T14 接上 row menu。
T16 依賴 T01；T17 完成公開 export 後，T18–T19 才接入 demos。
T21 依賴兩種入口與 mock export，T22 匯總各任務的驗證結果。

每一階段結束執行 checkpoint。Checkpoint 是技術驗證點，不新增逐項使用者批准流程。
只有需求變更或無法在已批准範圍內解決的問題才需要重新確認。

有行為變更的任務先補上能表達預期結果的測試，確認缺少實作時會失敗，再完成實作與驗證。
純 export 配置、demo 接線與文件不新增只重述實作的 unit test，改用 consumer build 與實際操作驗證。
修改 UI 與測試時遵循 repo 的 primitives 與 component/page-object skills；文件任務使用 writing-component-docs。

## 需要提早驗證的接點

**選單與焦點。** Table toolbar 使用 controlled DropdownMenu。一般 row 與 board 使用 Popover；calendar 與 timeline 使用 ContextMenu。
RowActionMenu 也註冊刪除與複製快捷鍵。開啟歷史時需先記住觸發元素、關閉所屬容器，再顯示 dialog。
不要把 RowActionMenu 綁死在某一種 popup primitive；由各 host 提供最小的關閉交接。
原選單關閉後，快捷鍵不能繼續在 log dialog 作用。Dialog 的 Escape 也不能誤觸背景 row view 的關閉操作。

**歷史資料。** Row record 的 property/name/icon/type/config/value 都來自 API。
測試必須在目前欄位已改名、改類型或不存在時，仍驗證原紀錄的內容。
Checkbox 的 false、number 的 zero 必須與 Empty 區分。
Created-time 與 last-edited-time 使用已解析的歷史 timestamp，不從目前 row 推算。

**載入邊界。** 第一次錯誤可以重試；後續頁錯誤保留內容並重試同一 cursor。
相同 ID 去重，已走過的 cursor 視為回應錯誤。空頁仍可有下一頁。
關閉、重新開啟、切換 row、移除 callback、unmount 都要隔離尚未結束的請求。

**測試範圍。** Request hook 測試負責競態與分頁細節；renderer 測試負責快照視覺語意；menu/dialog 測試負責互動。
Playwright 只覆蓋 jsdom 無法證明的實際捲動、焦點、popup 交接與幾個代表性流程。
不要在每一層重複整套相同案例。

## 驗證命令

所有 package verification 在 sandbox 外執行。每一條 pnpm 命令前都成功執行 `nvm use 24.11.1 --silent`。
使用既有 pnpm 11.0.8 與指定 store；不使用 bundled pnpm、Corepack 或新的 store。

下列命令從 repo root 執行。TODO 中的驗證代號對應此處：

**TV-TEST**：在命令尾加入該任務列出的 test 路徑；T22 才執行完整 table-view suite。

```sh
pnpm -F @notion-kit/table-view test
```

**PKG-TYPE、PKG-LINT、PKG-FORMAT、PKG-BUILD**：把 `<package>` 替換為 TODO 指定的實際套件名稱。
只執行該 task 所需的檢查；不為每個小任務重跑全部 consumer builds。

```sh
pnpm -F <package> typecheck
pnpm -F <package> lint
pnpm -F <package> format --write
pnpm -F <package> build
```

PKG-BUILD 用於 `@notion-kit/table-view`、`@notion-kit/registry`、`@notion-kit/storybook` 與 `@notion-kit/e2e`。
不要對 table-hook 執行這些命令，也不要用 Turbo 或 recursive filter 重建相依套件。
Docs 的既有 format script 排除 MDX，因此 MDX 需另做內容與 diff 檢查；不要宣稱該 script 已驗證 MDX。
Docs build 會重建整份 registry 並呼叫額外工具，本次預設以 registry build、docs typecheck 與實際 demo 檢視驗證文件整合。

**BROWSER**：先完成 table-view 與 E2E app 的 package build，再直接執行 Playwright：

```sh
pnpm -F @notion-kit/e2e exec playwright test tests/edit-log.spec.ts --project=chromium
```

不使用 `test:e2e` script，因為其 `pretest:e2e` 會透過 Turbo build 相依套件。
Playwright config 會啟動既有 port 3001 的 production server。

若 install、build 或 test 失敗，先記錄下列診斷與 package.json、workspace、lockfile 中的版本宣告，再診斷失敗原因：

```sh
node --version
"$NVM_BIN/pnpm" --version
"$NVM_BIN/pnpm" store path
```

不讀取或輸出 `.npmrc` 憑證。不因驗證失敗變更套件管理策略。

## 交付標準

- 所有 TODO acceptance criteria 完成，測試結果記錄在對應 task 或 checkpoint。
- 未傳 fetch callback 的 TableView 維持原有入口與編輯行為；有 callback 也不自動記錄或提前 fetch。
- Dialog、Load more、重試、快照值與 action icon 符合 spec。
- Demos 清楚標示靜態示例歷史；新增或修改 demo row 不會產生新的 log。
- 公開型別與 mock export 可被 consumer 匯入，正常 package root 不匯入 mock fixtures。
- Table-hook 保持零變更；變更清單只包含本功能需要的 table-view、demo、docs 與驗證檔案。
- 完成一次適當範圍的測試與 build 後，只有新改動、失敗或未解疑慮才擴大或重跑驗證。
