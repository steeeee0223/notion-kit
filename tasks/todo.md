# Table-view edit log TODO

狀態：尚未開始實作。依據 [plan.md](./plan.md) 與 [spec](../docs/superpowers/specs/2026-09-17-table-view-edit-log-design.md)。

**硬性限制：所有任務均不得寫入 `packages/table-hook/`。**
驗證代號與完整命令見 plan。此處的 `TV/` 代表 `packages/table-view/`，`E2E/` 代表 `apps/e2e/`。
標示「新增」的檔案是預計產物，目前尚不存在。所有未勾選項目都是未完成的工作。

## T01：定義 log contract 與回應驗證

建立 table-view 自有的記錄、快照、分頁與 fetch 型別，驗證外部回應。

依賴：無。範圍：M，4 個檔案。
檔案：新增 `TV/src/edit-log/types.ts`、`schemas.ts`、`schemas.test.ts`；修改 `TV/src/index.ts`。

- [ ] 定義兩個獨立 fetch callback、`EditLogPage`、table summary record 與 row snapshot record，全部由 table-view 匯出。
- [ ] Zod 驗證頁面、ID、有效 timestamp、icon、必要欄位及 requested rowId；未知 action/type 可保留供 fallback 使用。
- [ ] 將 value/config 留給 renderer 分類驗證；結構不合法的整頁回報失敗，不把外部資料直接 cast 成可信型別。

驗證：TV-TEST `src/edit-log/schemas.test.ts`；PKG-TYPE `@notion-kit/table-view`。

## T02：實作獨立的分頁 request hook

建立只由開啟、Load more、Retry 驅動的請求流程。

依賴：T01。範圍：S，2 個檔案。
檔案：新增 `TV/src/edit-log/use-edit-log.ts`、`use-edit-log.test.tsx`。

- [ ] 第一頁、追加頁、empty、loading、error 與 retry 行為完整；同時最多一個有效請求，重複 ID 去重。
- [ ] Abort 與 session identity 防止關閉、切換 row、unmount、移除 callback 後的舊回應寫入；換 callback reference 不自動重查。
- [ ] 測試空頁帶 cursor、終止頁、非前進 cursor、追加頁失敗保留內容，以及 callback 忽略 AbortSignal 的競態。

驗證：TV-TEST `src/edit-log/use-edit-log.test.tsx`，使用可控制 resolve/reject 的 promise，不使用真實網路與固定等待。

## T03：建立 table log dialog

先完成一條可操作的 table history 清單，供後續 menu 接入。

依賴：T01、T02。範圍：M，5 個檔案。
檔案：新增 `TV/src/edit-log/edit-log-dialog.tsx`、`table-edit-log-item.tsx`、`action-icon.tsx`、`edit-log-dialog.test.tsx`、`TV/src/__tests__/component-objects/edit-log-dialog.ts`。

- [ ] 使用既有 Dialog、Button、scrolling primitives，呈現時間、action icon、target name 與 summary；未知 action 使用 Clock。
- [ ] 清單底部的 Load more 只在有下一頁時出現，需點擊才 fetch；loading、empty、retry 可操作且具 accessible name。
- [ ] 長文字可換行，追加頁不重建既有 list；close、Escape、time element 與焦點交接接口可測試。

驗證：TV-TEST `src/edit-log/edit-log-dialog.test.tsx`。

### Checkpoint A：可獨立操作的 table history

- [ ] T01–T03 的 focused tests 與 table-view typecheck 通過。
- [ ] Contract、hook 與 dialog 均不讀取 table mutation callback；執行 plan 的 table-hook 保護檢查。

## T04：在 TableViewWrapper 承載 log controller

讓完整 TableView 與 wrapper 組合共享同一個 history controller。

依賴：T03。範圍：M，4 個檔案。
檔案：新增 `TV/src/edit-log/edit-log-provider.tsx`、`edit-log-provider.test.tsx`；修改 `TV/src/table-contexts/table-view-provider.tsx`、`TV/src/edit-log/types.ts`。

- [ ] Wrapper 接收 fetch props，從傳給 useTableView 的 options 中取出；未提供 callback 時沒有對應能力或 fetch。
- [ ] Controller/dialog state 與 table resource context 分離，穩定的 open/capability context 不隨分頁改變。
- [ ] 每個 wrapper 只有一個 dialog；支援自訂 children、callback 移除與明確的 focus-return target。

驗證：TV-TEST `src/edit-log/edit-log-provider.test.tsx`；PKG-TYPE `@notion-kit/table-view`。

## T05：接上 table menu 入口

讓使用者從目前的 View Settings 選單開啟 table history。

依賴：T04。範圍：M，最多 4 個檔案。
檔案：修改 `TV/src/menus/table-view-menu.tsx`、`table-view-menu.test.tsx`、`TV/src/tools/toolbar.tsx`、`TV/src/__tests__/component-objects/view-settings-menu.ts`。

- [ ] 只有 `fetchTableEditLogs` 存在時顯示 Edit log，開啟選單本身不 fetch；locked table 仍能查看。
- [ ] 選取後關閉原選單並開啟 dialog，關閉 dialog 後還原到 Settings trigger。
- [ ] 測試只有 table callback、只有 row callback、都沒有與兩者皆有時的入口可見性。

驗證：TV-TEST `src/menus/table-view-menu.test.tsx`。

## T06：建立可選的唯讀 plugin renderer

提供快照繪製與文字 fallback，不連接正常 cell 的編輯機制。

依賴：T01、T04。範圍：M，4 個檔案。
檔案：修改 `TV/src/plugins/registry.ts`、`index.ts`；新增 `TV/src/edit-log/read-only-value.tsx`、`read-only-value.test.tsx`。

- [ ] `TableUiPlugin.renderReadOnlyValue` 可選，輸入只有歷史資料/config/metadata/textValue；舊 plugin 保持相容。
- [ ] 缺少 renderer、未知 type 或 value 驗證失敗時顯示 textValue，不查詢目前 column/cell。
- [ ] 將 custom renderer 放在單筆 error boundary 內，render 錯誤只讓該 entry 使用 fallback。

驗證：TV-TEST `src/edit-log/read-only-value.test.tsx` 與既有 `src/plugins/registry.test.ts`；PKG-TYPE `@notion-kit/table-view`。

### Checkpoint B：真實 table menu 可查歷史

- [ ] T04–T06 的 tests 通過；實際 table menu 能開啟並關閉 dialog。
- [ ] PKG-BUILD `@notion-kit/table-view` 通過；table-hook 保護檢查無差異。

## T07：Text 與 title 歷史值

把現有文字樣式接入 snapshot renderer。

依賴：T06。範圍：M，4 個檔案。
檔案：修改 `TV/src/plugins/text/text-cell.tsx`、`text/plugin.tsx`、`title/plugin.tsx`；新增 `TV/src/edit-log/read-only-text.test.tsx`。

- [ ] Text 與 title 可顯示歷史字串與換行，空字串顯示 Empty。
- [ ] 只縮小文字 value 元件需要的 props；不建立 fake row、不掛載 TitleTableSlot 或編輯 popover。
- [ ] 不合法的輸入顯示 textValue，正常 cell 原有的編輯與 title 開啟功能仍通過既有測試。

驗證：TV-TEST `src/edit-log/read-only-text.test.tsx`、`src/plugins/title/title-cell.test.tsx`。

## T08：Checkbox 與 link 歷史值

重用 checkbox 和 email、phone、URL 的唯讀 value 樣式。

依賴：T06。範圍：M，5 個檔案。
檔案：修改 `TV/src/plugins/checkbox/checkbox-cell.tsx`、`checkbox/plugin.tsx`、`link/link-cell.tsx`、`link/plugin.tsx`；新增 `TV/src/edit-log/read-only-checkbox-link.test.tsx`。

- [ ] Checkbox 的 true 與 false 都可見且不可切換，提供可讀的 accessible value。
- [ ] Link 沿用目前文字與連結行為；歷史值不掛載 editor，保留現有 href 防護。
- [ ] 空字串與不合法的 input 正確使用 Empty 或 textValue，且 value 元件不需要 live row。

驗證：TV-TEST `src/edit-log/read-only-checkbox-link.test.tsx`；PKG-TYPE `@notion-kit/table-view`。

### Checkpoint C：基礎值顯示

- [ ] T07–T08 的 tests 通過；讀取歷史值不觸發任何 data/config callback。
- [ ] Table-hook 保護檢查無差異。

## T09：Select 與 multi-select 歷史值

使用快照中的 option metadata 顯示標籤。

依賴：T06。範圍：M，4 個檔案。
檔案：修改 `TV/src/plugins/select/select-cell.tsx`、`plugin.tsx`；新增同目錄的 `read-only-value.tsx`、`read-only-value.test.tsx`。

- [ ] Zod 驗證歷史 select config 與 value，重用 SelectCellValue 的標籤、顏色與換行。
- [ ] 當目前 option 已改名、改色、刪除，或整個 property 不存在，仍使用快照顯示。
- [ ] 選中值缺少對應 option metadata 時使用 textValue，不能靜默省略；空值顯示 Empty。

驗證：TV-TEST `src/plugins/select/read-only-value.test.tsx`、`src/plugins/select/select-cell.test.tsx`。

## T10：Number 歷史值

使用歷史 number config 繪製數字、bar 或 ring。

依賴：T06。範圍：M，4 個檔案。
檔案：修改 `TV/src/plugins/number/number-cell.tsx`、`plugin.tsx`；新增同目錄的 `read-only-value.tsx`、`read-only-value.test.tsx`。

- [ ] Zod 驗證資料與設定，重用 NumberCellValue，保留歷史 format、rounding 與 display type。
- [ ] Numeric zero 正確顯示；null 顯示 Empty；無效 config/value 使用 textValue。
- [ ] Number input editor 與目前 property config 都不參與歷史值繪製。

驗證：TV-TEST `src/plugins/number/read-only-value.test.tsx`、`src/plugins/cell-renderers.test.tsx`。

## T11：Date 與 timestamp 歷史值

支援 date、created-time 與 last-edited-time 的歷史格式。

依賴：T06。範圍：M，5 個檔案。
檔案：修改 `TV/src/plugins/date/plugin.tsx`、`date-cell/date-cell.tsx`、`date-cell/date-picker-cell.tsx`；新增 `TV/src/plugins/date/read-only-value.tsx`、`read-only-value.test.tsx`。

- [ ] Zod 驗證歷史日期與 config，重用 value 元件顯示時間、日期範圍與時區格式。
- [ ] Created-time/last-edited-time 從 log 的 resolved timestamp 顯示，不讀目前 row metadata。
- [ ] 空日期顯示 Empty；無效日期、時區或設定使用 textValue，不掛載日期編輯器。

驗證：TV-TEST `src/plugins/date/read-only-value.test.tsx`、`src/plugins/date/date-cell/date-cell.test.tsx`；PKG-TYPE `@notion-kit/table-view`。

### Checkpoint D：內建 cell 歷史樣式完整

- [ ] T09–T11 的 tests 與受影響的既有 plugin tests 通過。
- [ ] PKG-BUILD `@notion-kit/table-view` 通過；table-hook 保護檢查無差異。

## T12：在 dialog 顯示 row log

組合歷史 property icon/name 與各類型的 read-only renderer。

依賴：T03、T06–T11。範圍：M，4 個檔案。
檔案：新增 `TV/src/edit-log/row-edit-log-item.tsx`、`row-edit-log-item.test.tsx`；修改 `edit-log-dialog.tsx`、`TV/src/__tests__/component-objects/edit-log-dialog.ts`。

- [ ] Row entry 顯示時間、歷史 property icon/name、箭頭與快照值，不使用 table action icon。
- [ ] Row history 使用相同的 loading、pagination、retry 流程；title 在開啟時取得，找不到時回退 rowId。
- [ ] Property 已移除、未知 type、自訂 icon 或錯誤 renderer 都不影響其他紀錄。

驗證：TV-TEST `src/edit-log/row-edit-log-item.test.tsx`、`src/edit-log/edit-log-dialog.test.tsx`。

## T13：接上 row action menu

提供受 fetch capability 控制的入口與 host 關閉交接。

依賴：T04、T12。範圍：M，3 個檔案。
檔案：修改 `TV/src/menus/row-action-menu.tsx`、`row-action-menu.test.tsx`、`TV/src/__tests__/component-objects/row-actions.ts`。

- [ ] 只有 `fetchRowEditLogs` 存在才顯示 Edit log；點擊才送出該 rowId 的第一頁 request。
- [ ] 透過最小的 host callback 交接關閉與 focus target，不直接依賴 PopoverClose 或某一種 popup context。
- [ ] 開啟歷史後 RowActionMenu 的 delete/duplicate hotkeys 不再作用；既有搜尋與其他 row actions 保持原有行為。

驗證：TV-TEST `src/menus/row-action-menu.test.tsx`。

## T14：完成各 layout 的 popup 交接

讓既有 Popover 與 ContextMenu host 都正確開啟 row history。

依賴：T13。範圍：M，5 個檔案。
檔案：修改 `TV/src/common/row-action-group.tsx`、`board-view/board-card.tsx`、`calendar-view/calendar-view-content.tsx`、`timeline-view/timeline-track-row.tsx`；新增 `TV/src/edit-log/entry-points.test.tsx`。

- [ ] 一般 row、board、calendar、timeline 的來源選單關閉後才將互動交給 dialog，不殘留兩個可操作 popup。
- [ ] 關閉 dialog 回到原 trigger；trigger 已移除時使用 table 範圍內的 fallback，不跳到其他 table。
- [ ] 沿用各 layout 既有 locked/menu 可用性；不新增其他 layout 入口或改變 row editing 規則。

驗證：TV-TEST `src/edit-log/entry-points.test.tsx`，先測 Popover 與 ContextMenu 各一例，再由 browser 覆蓋真實互動。

### Checkpoint E：兩種入口完整

- [ ] T12–T14 的 focused tests 通過；table/row 都可開啟、載入更多與關閉。
- [ ] 原 row menu 不再接收 log dialog 的快捷鍵；table-hook 保護檢查無差異。

## T15：驗證效能邊界與正常編輯不受影響

以代表性的整合案例驗證使用者最在意的隔離要求。

依賴：T05、T14。範圍：M，最多 4 個檔案。
檔案：修改 `TV/src/table-contexts/table-view-reactivity.test.tsx`、`TV/src/edit-log/edit-log-provider.test.tsx`、`entry-points.test.tsx`；必要時調整 `TV/src/row-view/view-nav.tsx` 的背景快捷鍵處理。

- [ ] Mount、開 menu、編輯 cell/config、切 layout 都不 fetch log；只有明確的 history 操作呼叫 API。
- [ ] Pagination 不重新執行未變更的 table cell renderer；viewing log 不觸發 data/properties/view mutation callback。
- [ ] 以兩個 table instance、已開啟 row view、callback 移除與延遲回應驗證隔離；Escape 只關閉目前 history。

驗證：TV-TEST 上列三份 test，與既有 row-action/cell-renderer tests；不新增時間型 benchmark。

## T16：建立靜態 mock log API

依輸入 fixture 一次準備示例紀錄，提供與實際 API 相同的分頁行為。

依賴：T01。範圍：M，3 個檔案。
檔案：新增 `TV/src/mock.ts`、`edit-log/mock-fixtures.ts`、`mock.test.ts`。

- [ ] `createMockEditLogApi({ data, properties, pageSize? })` 回傳兩個 stable callbacks，預設每頁 10 筆、排序固定、支援 row 篩選與 abort。
- [ ] 預設 table 與 seeded row history 都超過一頁，涵蓋 action icons、各 fixture 可用的 cell types 與歷史快照。
- [ ] 不修改輸入 fixture、不訂閱 demo 變更；回應是獨立副本，未知或新 row 回傳空頁；拒絕無效 pageSize/cursor。

驗證：TV-TEST `src/mock.test.ts`，包含兩個 factory instance 的資料隔離。

## T17：公開 mock subpath

讓 demos 從 table-view package 的獨立 mock entry 匯入 factory。

依賴：T16。範圍：S，2 個檔案。
檔案：修改 `TV/package.json`、`TV/tsdown.config.ts`。

- [ ] `@notion-kit/table-view/mock` 的 JS 與 declarations 指向產出的 mock entry。
- [ ] 正常 package root 不 re-export 或 import mock factory/fixtures，不增加 runtime dependency。
- [ ] Build 後可從 mock subpath 匯入 factory；既有 root、menus exports 保持可用。

驗證：PKG-BUILD、PKG-TYPE `@notion-kit/table-view`；檢查 dist exports 與實際 import，不為純 export 配置新增鏡像 unit test。

### Checkpoint F：隔離與 mock contract

- [ ] T15–T17 的驗證通過；正常 table entry 未載入 mock fixtures。
- [ ] Table-hook 保護檢查無差異，既有 fixture 檔案沒有變更。

## T18：接入 registry demos

讓 docs 使用的 controlled、uncontrolled 與 calendar demos 展示歷史。

依賴：T14、T17。範圍：M，3 個檔案。
檔案：修改 `packages/registry/src/table-view-controlled/table-view-controlled.tsx`、`table-view-uncontrolled/table-view-uncontrolled.tsx`、`table-view-calendar/table-view-calendar.tsx`。

- [ ] 各 demo 從初始 fixture 建立一次 mock API，傳入兩個 fetch props，不在 render 或編輯後重建 history。
- [ ] Table/row dialog 與 Load more 可操作；calendar 的 mock rowId 與初始事件一致。
- [ ] 清楚標示歷史為靜態示例；目前 table 的編輯與 controlled/uncontrolled 使用方式保持原樣。

驗證：PKG-TYPE、PKG-BUILD `@notion-kit/registry`；實際檢視三個 demo，不為單純接線新增 unit tests。

## T19：接入 Storybook demos

在既有 database 與各 layout stories 提供相同的 mock history。

依賴：T17、T18。範圍：M，最多 5 個檔案。
檔案：修改 `apps/storybook/src/stories/collections/table-view/database/data.ts`、`database/database.tsx`、`table-view.stories.tsx`、`table-menus.stories.tsx`；必要時新增同目錄的 `edit-log.stories.tsx`，僅用來展示難以從既有 stories 檢查的狀態。

- [ ] Database、controlled、list、board、timeline 共用由現有 fixture 建立的 mock callbacks；calendar 使用已更新的 registry demo。
- [ ] 獨立 menu stories 使用 wrapper 的單一 log controller，並遵守 menu host 的關閉交接。
- [ ] 確認亮暗主題、長摘要、空值、標籤換行與 Load more；不可為 story 把 mock 注入正式 package root。

驗證：PKG-TYPE、PKG-BUILD `@notion-kit/storybook`；視覺檢查代表性的 table、board、calendar stories。

## T20：文件說明與使用範例

記錄 optional fetch API 與歷史 renderer contract。

依賴：T17–T19。範圍：S，2 個檔案。
檔案：修改 `apps/docs/content/docs/blocks/table-view/index.mdx`、`cell-plugins.mdx`。

- [ ] 說明 callback 決定入口可見性、按需查詢、cursor/abort、table summary 與 row snapshot payload。
- [ ] 提供 mock subpath 用法及 `renderReadOnlyValue` 的 optional/fallback 規則，明示靜態 demo 不記錄新操作。
- [ ] API 範例與 exports 相符，沿用既有 docs 結構與 demo 元件；不加入 versioning 或 undo 的使用承諾。

驗證：PKG-TYPE `@notion-kit/docs`；檢閱 MDX 與實際預覽。遵循 writing-component-docs，格式 script 排除 MDX 的限制不可忽略。

### Checkpoint G：可展示與可串接

- [ ] T18–T20 驗證通過，demo 與文件使用相同的公開 API。
- [ ] Import 均指向 table-view/mock；table-hook 保護檢查無差異。

## T21：真實瀏覽器驗證

使用現有 E2E app 驗證捲動、焦點與來源選單交接。

依賴：T14、T15、T17。範圍：M，4 個檔案。
檔案：修改 `E2E/src/app/table-view/controlled/page.tsx`、`uncontrolled/page.tsx`；新增 `E2E/tests/component-objects/edit-log-dialog.ts`、`tests/edit-log.spec.ts`。

- [ ] 使用 stable mock callbacks，從 table 與 row menu 開啟 dialog，實際捲到底並點 Load more；捲動本身不載入下一頁。
- [ ] 驗證追加紀錄時維持閱讀位置、Escape/focus return、Popover/ContextMenu 各一個案例，以及 modal 期間不會刪除或複製 row。
- [ ] 使用既有 table/menu objects 與新增 dialog object；spec 從 `./fixtures` 匯入 test/expect，保留 coverage fixture。

驗證：PKG-BUILD `@notion-kit/table-view`、`@notion-kit/e2e`，然後 BROWSER。不得執行會遞迴 build table-hook 的 pretest script。

## T22：完成 package checks 與 scope review

確認所有已承諾行為與 package boundary，記錄可交付證據。

依賴：T01–T21。範圍：S，僅更新任務證據與必要的規劃狀態。
檔案：`tasks/todo.md`、`tasks/plan.md`。若驗證發現 runtime 問題，回到該問題所屬任務修正，不把此任務擴成未界定的修改。

- [ ] 完整 TV-TEST 通過；對受影響的 table-view、registry、storybook、e2e 執行 PKG-TYPE、PKG-LINT、PKG-FORMAT，docs 執行適用的 type/lint 與 MDX 檢閱。
- [ ] 保留各 task 已通過的 build/browser 結果；只有其後改動影響結果時才重跑，檢查 formatted diff 沒有無關變更。
- [ ] `git diff --check`、table-hook 保護檢查與最終檔案範圍檢查通過；記錄實際命令、結果與仍存在的限制。

驗證：使用 plan 的指令表，執行前重新確認版本宣告；失敗先做指定環境診斷。

### Checkpoint H：交付

- [ ] T01–T22 acceptance criteria 完成，沒有未說明的失敗。
- [ ] 未提供 fetch API 時入口隱藏，正常編輯路徑沒有新增 log 工作；已提供時兩種歷史都能查詢。
- [ ] `packages/table-hook/` 與基準完全一致，沒有新增檔案或對該 package 的寫入任務。
- [ ] 回報功能、驗證結果與文件位置；依使用者後續指示決定 commit/PR，不自行擴充功能。
