# Calendar view 執行清單

日期：2026-09-16。狀態：實作與驗證完成；使用 `/Users/awen/Documents/ts-space/notion-kit` local checkout 的 `codex/calendar-view` 分支，未建立 worktree。

文件：[設計規格](../docs/superpowers/specs/2026-09-16-calendar-view-design.md)、[實作計畫](plan.md)。

本文件是唯一的執行狀態清單。每項 C 任務的檔案、依賴、驗收條件與命令位於 plan 的同編號段落。完成程式不代表驗證通過；兩個 checkbox 分開勾選，並在下方驗證紀錄補上實際證據。

## 文件交付

- [x] 整理已確認的行為、API 邊界及資料規則。
- [x] 撰寫有依賴、檔案範圍、驗收條件及檢查方式的 plan。
- [x] 建立本 todo，實作前所有產品與驗證項目維持未勾選；完成後依證據更新。
- [x] 使用者要求在 local branch 以 subagents 實作，先設計測試且避免重複測試。

## 實作與逐項驗證

### C01：建立 Calendar 日期與事件契約

依賴：無。詳見 [plan C01](plan.md#c01建立-calendar-日期與事件契約)。

- [x] C01 實作完成，符合 plan 的驗收條件。
- [x] C01 指定驗證通過，已記錄證據。

### C02：遷移 Table 共用日期設定

依賴：C01。詳見 [plan C02](plan.md#c02遷移-table-共用日期設定)。

- [x] C02 實作完成，符合 plan 的驗收條件。
- [x] C02 指定驗證通過，已記錄證據。

### C03：接回 Timeline 與 Layout menu

依賴：C02。詳見 [plan C03](plan.md#c03接回-timeline-與-layout-menu)。

- [x] C03 實作完成，符合 plan 的驗收條件。
- [x] C03 指定驗證通過，已記錄證據。

### C04：完成 Timeline 元件測試遷移

依賴：C03。詳見 [plan C04](plan.md#c04完成-timeline-元件測試遷移)。

- [x] C04 實作完成，符合 plan 的驗收條件。
- [x] C04 指定驗證通過，已記錄證據。

### C05：遷移範例與瀏覽器測試的舊 API

依賴：C04。詳見 [plan C05](plan.md#c05遷移範例與瀏覽器測試的舊-api)。

- [x] C05 實作完成，符合 plan 的驗收條件。
- [x] C05 指定驗證通過，已記錄證據。

### C06：抽出 UI 內部日期控制項

依賴：C01。詳見 [plan C06](plan.md#c06抽出-ui-內部日期控制項)。

- [x] C06 實作完成，符合 plan 的驗收條件。
- [x] C06 指定驗證通過，已記錄證據。

### C07：讓 Timeline 使用內部控制項

依賴：C06。詳見 [plan C07](plan.md#c07讓-timeline-使用內部控制項)。

- [x] C07 實作完成，符合 plan 的驗收條件。
- [x] C07 指定驗證通過，已記錄證據。

### C08：建立 Calendar provider 與導覽工具列

依賴：C01、C06。詳見 [plan C08](plan.md#c08建立-calendar-provider-與導覽工具列)。

- [x] C08 實作完成，符合 plan 的驗收條件。
- [x] C08 指定驗證通過，已記錄證據。

### C09：讓 Timeline 瀏覽日期可受控

依賴：C07。詳見 [plan C09](plan.md#c09讓-timeline-瀏覽日期可受控)。

- [x] C09 實作完成，符合 plan 的驗收條件。
- [x] C09 指定驗證通過，已記錄證據。

### C10：計算 Month 與全天事件的分段

依賴：C01。詳見 [plan C10](plan.md#c10計算-month-與全天事件的分段)。

- [x] C10 實作完成，符合 plan 的驗收條件。
- [x] C10 指定驗證通過，已記錄證據。

### C11：呈現可開啟事件的 Month

依賴：C08、C10。詳見 [plan C11](plan.md#c11呈現可開啟事件的-month)。

- [x] C11 實作完成，符合 plan 的驗收條件。
- [x] C11 指定驗證通過，已記錄證據。

### C12：開放 Calendar 入口與獨立預覽

依賴：C09、C11。詳見 [plan C12](plan.md#c12開放-calendar-入口與獨立預覽)。

- [x] C12 實作完成，符合 plan 的驗收條件。
- [x] C12 指定驗證通過，已記錄證據。

### C13：在 Table 層保存瀏覽日期

依賴：C05、C09。詳見 [plan C13](plan.md#c13在-table-層保存瀏覽日期)。

- [x] C13 實作完成，符合 plan 的驗收條件。
- [x] C13 指定驗證通過，已記錄證據。

### C14：共用日期 property 解析與初始化

依賴：C03。詳見 [plan C14](plan.md#c14共用日期-property-解析與初始化)。

- [x] C14 實作完成，符合 plan 的驗收條件。
- [x] C14 指定驗證通過，已記錄證據。

### C15：把 Table rows 轉成 Calendar 事件

依賴：C01、C14。詳見 [plan C15](plan.md#c15把-table-rows-轉成-calendar-事件)。

- [x] C15 實作完成，符合 plan 的驗收條件。
- [x] C15 指定驗證通過，已記錄證據。

### C16：啟用 Table Calendar 月份檢視

依賴：C12、C13、C15。詳見 [plan C16](plan.md#c16啟用-table-calendar-月份檢視)。

- [x] C16 實作完成，符合 plan 的驗收條件。
- [x] C16 指定驗證通過，已記錄證據。

### C17：支援一次建立 row 與初始日期

依賴：C02。詳見 [plan C17](plan.md#c17支援一次建立-row-與初始日期)。

- [x] C17 實作完成，符合 plan 的驗收條件。
- [x] C17 指定驗證通過，已記錄證據。

### C18：從 Calendar 建立並開啟資料

依賴：C16、C17。詳見 [plan C18](plan.md#c18從-calendar-建立並開啟資料)。

- [x] C18 實作完成，符合 plan 的驗收條件。
- [x] C18 指定驗證通過，已記錄證據。

### C19：計算時間格線分段與重疊

依賴：C01、C10。詳見 [plan C19](plan.md#c19計算時間格線分段與重疊)。

- [x] C19 實作完成，符合 plan 的驗收條件。
- [x] C19 指定驗證通過，已記錄證據。

### C20：呈現 Week 與 Day 時間格線

依賴：C11、C19。詳見 [plan C20](plan.md#c20呈現-week-與-day-時間格線)。

- [x] C20 實作完成，符合 plan 的驗收條件。
- [x] C20 指定驗證通過，已記錄證據。

### C21：移動事件並保留來源偏移

依賴：C20。詳見 [plan C21](plan.md#c21移動事件並保留來源偏移)。

- [x] C21 實作完成，符合 plan 的驗收條件。
- [x] C21 指定驗證通過，已記錄證據。

### C22：拉伸事件的真正起訖邊界

依賴：C21。詳見 [plan C22](plan.md#c22拉伸事件的真正起訖邊界)。

- [x] C22 實作完成，符合 plan 的驗收條件。
- [x] C22 指定驗證通過，已記錄證據。

### C23：轉換全天與指定時間事件

依賴：C22。詳見 [plan C23](plan.md#c23轉換全天與指定時間事件)。

- [x] C23 實作完成，符合 plan 的驗收條件。
- [x] C23 指定驗證通過，已記錄證據。

### C24：把完整操作寫回 Table 日期

依賴：C18、C23。詳見 [plan C24](plan.md#c24把完整操作寫回-table-日期)。

- [x] C24 實作完成，符合 plan 的驗收條件。
- [x] C24 指定驗證通過，已記錄證據。

### C25：完成手勢生命週期與鍵盤行為

依賴：C24。詳見 [plan C25](plan.md#c25完成手勢生命週期與鍵盤行為)。

- [x] C25 實作完成，符合 plan 的驗收條件。
- [x] C25 指定驗證通過，已記錄證據。

### C26：建立瀏覽器場景與 component objects

依賴：C25。詳見 [plan C26](plan.md#c26建立瀏覽器場景與-component-objects)。

- [x] C26 實作完成，符合 plan 的驗收條件。
- [x] C26 指定驗證通過，已記錄證據。

### C27：驗證真實瀏覽器中的完整流程

依賴：C26。詳見 [plan C27](plan.md#c27驗證真實瀏覽器中的完整流程)。

- [x] C27 實作完成，符合 plan 的驗收條件。
- [x] C27 指定驗證通過，已記錄證據。

### C28：加入可安裝的 Calendar 範例

依賴：C25。詳見 [plan C28](plan.md#c28加入可安裝的-calendar-範例)。

- [x] C28 實作完成，符合 plan 的驗收條件。
- [x] C28 指定驗證通過，已記錄證據。

### C29：完成使用文件與 Storybook 範例

依賴：C27、C28。詳見 [plan C29](plan.md#c29完成使用文件與-storybook-範例)。

- [x] C29 實作完成，符合 plan 的驗收條件。
- [x] C29 指定驗證通過，已記錄證據。

### C30：完成跨套件驗收與記錄

依賴：C29。詳見 [plan C30](plan.md#c30完成跨套件驗收與記錄)。

- [x] C30 實作完成，符合 plan 的驗收條件。
- [x] C30 指定驗證通過，已記錄證據。

## 階段 checkpoint

- [x] K01（C01）：日期換算、空 end、午夜與 DST 契約通過 V1。
- [x] K02（C02、C03、C04、C05）：API 遷移完整；Timeline 相關測試、型別及既有瀏覽器案例通過。
- [x] K03（C06、C07、C08）：共用控制項保持內部，兩種 view 導覽測試通過。
- [x] K04（C09、C10、C11、C12）：獨立 Month 可從公開入口使用；受控 Timeline 日期與視覺預覽通過。
- [x] K05（C13、C14、C15、C16）：Table Month 可讀取、開啟資料；共用日期、range 與 property 正確。
- [x] K06（C17、C18）：原子新增及 controlled 接受、拒絕均已驗證。
- [x] K07（C19、C20）：Week、Day 的全天區、時間格線與重疊事件通過檢查。
- [x] K08（C21、C22、C23）：移動、雙端拉伸、全天互轉均通過，空 end 與分段偏移正確。
- [x] K09（C24、C25）：Table 完整操作、取消、鎖定及 auto-scroll 正確。
- [x] K10（C26、C27）：獨立 UI、Table 與 Timeline 的真實瀏覽器案例通過。
- [x] K11（C28、C29、C30）：Registry、文件及最終檢查完成，實際證據已記錄。

## 規格覆蓋檢查

- [x] Month：完整週列、跨週橫條、多事件增高與只有垂直捲動。
- [x] Week、Day：全天區、小時標籤、整點和半小時隔線、重疊事件。
- [x] 瀏覽：共用 property、range、anchorDate，fallback 只在不支援時發生。
- [x] 日期：時區、午夜、DST、包含式全天 end 與空 end。
- [x] 編輯：原子新增、開啟、移動、雙端拉伸與全天互轉。
- [x] 邊界：受控拒絕、鎖定、取消、外部更新和手勢失效。
- [x] 公開 API：獨立 Calendar 可用，共用通用控制項未公開，日期 picker 不受影響。
- [x] 回歸：Timeline 導覽、初始化、拖曳與拉伸仍正常。
- [x] 文件：Registry、Storybook、Calendar 文件與 Table API 遷移對照一致。

## 驗證紀錄

所有 pnpm 驗證均先執行 `nvm use 24.11.1 --silent`，使用 `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F <package>`，於 sandbox 外的 `/Users/awen/Documents/ts-space/notion-kit` 執行。

- 2026-09-16，實作前完成 [測試分工設計](calendar-test-design.md)。先由三位 subagents 盤點既有測試，review 後才開始實作。
- C02、C17：`@notion-kit/table-hook test`，20 files / 391 tests 通過；typecheck、lint、build 通過。先觀察 17 個預期失敗，再完成實作；主要擴充既有 resource/row tests，只新增三個測試宣告。
- C01、C06～C12、C19～C23、C25：UI 完整測試 25 files / 212 tests 通過（Calendar 6 suites / 31 tests）；typecheck、lint、build 通過。Lint 有 14 個既有警告，沒有 Calendar 新增警告。公開 Calendar、Timeline 與 primitives Calendar 入口可匯入，內部 date-view subpath 不可匯入。
- C09：新增 external anchor、sidebar、latest scroll、timezone 與 smooth scrolling 回歸；timezone origin 和 accepted-scroll snap 均先觀察失敗再修復，已包含於上述完整 UI 測試。
- Table-view 完整測試初次為 56 files / 531 passed、1 failed；失敗的 Timeline resize fixture 仍用瀏覽器本地午夜，已依指定 UTC property 改為 Date.UTC，保留精確 timestamp 斷言。之後 Calendar、date-view、Timeline、layout menu、bulk-edit 的 11 files / 112 tests 通過；未重跑未受影響的測試。
- Review regression：flushSync owner 接受後未開啟新增 row、native column filter 未刷新 Calendar，皆先在原有整合 suites 重現，再修復。relative-date filter 跨午夜原本已正常，不新增多餘 subscription。
- Source review 核對 Calendar 文件、公開 API 與 demos；唯讀範例改為只提示可開啟事件。
- Table-view 最終 typecheck、format、lint、build 通過；lint 只有 full-view.tsx 的既有 h1 警告。
- Browser 揭露 child layout effect 早於 provider ref attach，造成 sticky header offset 與初次 Week/Day 定位失效。修復後 UI 原有 component/drag suites 的 13 tests、typecheck、Calendar lint、build 通過；原有 Week/Day assertions 先失敗再轉綠。
- Browser fixture 的 pre-load fake Date 破壞 TZDate subclass：無 fake clock 的同頁資料正確，fake clock 的 DOM day 與 onCreate 都提前 8 小時。改為保留 Date constructor 的 clock offset；沒有為測試 mock 改寫產品時區算術。
- Browser auto-scroll 重現最後一次 pointer move 停在邊緣卻不捲動：dnd-kit 在 move callback 後才更新 operation.position.current。加入一個既有 drag suite regression，先觀察失敗，再改用 event.to/by。最終 Calendar 6 files / 32 tests、UI typecheck、Calendar lint、UI build 通過。初始時間捲動另依 sticky headers 實測高度保留空間，讓 08:00 與 Today 目標可見。
- Registry 最終 typecheck、lint、build 通過；Docs typecheck、lint 通過，最終 build 產生 66 routes；Storybook typecheck、lint、build 通過。Docs 與 Storybook 保留原有 lint/build warnings，沒有新增編譯錯誤。
- 多套件同時驗證曾造成 UI 測試 timeout；已改用串行重型檢查與 `--maxWorkers=1`，不提高 timeout，也不把 timeout 視為通過。

- C26、C27：E2E format、typecheck、lint、Turbo prebuild（8/8）與 Next production build 通過。最終 `calendar.spec.ts`、`calendar-table-view.spec.ts`、`timeline.spec.ts` 共 15 Chromium tests 在 33.9 秒內全部通過，沒有 retries。
- 視覺檢閱：獨立 Calendar 與 Table Calendar 的 Month、Week、Day，寬版、360px 窄版與 dark mode 均檢閱。Browser fixtures 使用 2026-09-16、UTC 的跨週/跨午夜/重疊/空 end 事件；重複時間場景使用 2026-11-01 America/New_York。涵蓋雙向 edge auto-scroll、跨午夜 resize、全天互轉、鍵盤新增與開啟。
- Docs 實際瀏覽另外重現兩份 CSS 中 `size-full` 覆寫自訂 height：原本 Month 747px、Week 1622px。改為 `h-full w-full` 讓 cn 移除預設 height，再以 production docs 確認 Month/Week/Day 皆為 560px、Table Calendar 為 700px；四個預覽均無水平 overflow 或 page errors。UI 與 Docs 已重新 build；這個樣式修正使用實際尺寸驗證，不另寫 class-name unit test。
- `git diff --check` 通過。實作位於 local branch `codex/calendar-view`。原先 Codex worktree 沒有修改；生成的 docs public registry 移至本機驗證產物，保留 tracked demo manifest。

### 截圖位置

Browser 截圖保存在 `apps/e2e/test-results/`：

- `calendar-CalendarLayout-Al-478db-thinNarrowAndWideContainers-chromium/`：`calendar-{month,week,day}-{1100,560,360,dark}.png`。
- `calendar-table-view-Calend-5bc59-DateOnceAndOpensAcceptedRow-chromium/`：Table Month 寬版、360px、dark。
- `calendar-table-view-Calend-6a5f5-DateOnceAndOpensAcceptedRow-chromium/`：Table Week 寬版、360px、dark。
- `calendar-table-view-Calend-6e122-DateOnceAndOpensAcceptedRow-chromium/`：Table Day 寬版、360px、dark。

Production docs 截圖與生成 registry：`/tmp/notion-kit-calendar-evidence-20260916/`。Docs previews 使用當天 UTC 範例資料，實際操作 Month/Week/Day 並檢查高度與 overflow。這些是本機驗證產物，未加入版本控制。
