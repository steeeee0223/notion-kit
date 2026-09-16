# Calendar view 設計

日期：2026-09-16。狀態：設計、實作與驗證完成；實際證據見執行清單。

配套文件：[實作計畫](../../../tasks/plan.md)、[執行清單](../../../tasks/todo.md)、[測試設計](../../../tasks/calendar-test-design.md)。

## 目標與範圍

新增可獨立使用的 `@notion-kit/ui/calendar`，並接入 `table-view` 與 `table-hook`。Calendar 支援月、週、日檢視，以及開啟、新增、移動和拉伸事件。

Calendar 與 Timeline 共用日期 property、range 與目前瀏覽日期。兩者保留各自的版面和互動引擎：Timeline 使用水平時間軸，Calendar 只有垂直捲動。

本次包含獨立元件範例、Table 整合範例、文件與互動驗證。圖片中的「Manage in Calendar」只屬於參考畫面，不代表本次需要外部日曆整合。重複事件、提醒、外部日曆同步、無日期資料抽屜，以及按 table grouping 拆分多份日曆，都不在本次範圍。

## 架構決策

### 共用設定與控制項，各自負責排版

Calendar 和 Timeline 共用 range 選單、日期導覽按鈕與標題樣式。這些控制項接受資料和 callbacks，不自行存取任一 view 的 context 或捲動容器。

兩個 view 各自把控制項接到自己的 context。Timeline 仍管理水平座標與時間軸；Calendar 管理月份換行、全天事件、時間格線及事件重疊。

曾考慮統一時間視圖引擎，但兩種座標與排列方式的差異會增加抽象複雜度，也會擴大 Timeline 重構。本次採共用設定及呈現控制項的邊界。

| 模組 | 責任 | 輸入與輸出 |
| --- | --- | --- |
| `packages/ui/src/calendar/`（新增） | 瀏覽日期、三種版面、事件分段與排列、拖曳和拉伸 | 通用事件與設定；操作 callbacks |
| `packages/ui/src/date-view/`（新增、內部） | 共用 range select、導覽按鈕、標題樣式 | 選項、值、標題、callbacks |
| `packages/ui/src/timeline/` | 現有時間軸；接入共用控制項與瀏覽日期控制 | Timeline 事件、range、瀏覽日期 |
| `packages/table-hook/` | 共用設定、range fallback、日期欄位與 row 更新 API | Table resources 與 resource actions |
| `packages/table-view/src/calendar-view/`（新增） | 解析日期 property、轉換事件、串接 row view 和資料寫入 | Table rows 與 UI Calendar callbacks |
| `packages/table-view/` 共用日期 view 邏輯 | 日期 property 選取與共用瀏覽日期 | 目前 table instance 的設定與暫存狀態 |

`ui/calendar` 不依賴 `table-hook` 或 `table-view`。日期 property、row ID 的查找、資料儲存及開啟資料頁，都由 Table adapter 處理。

### 公開匯出仿照 Timeline

新增 `@notion-kit/ui/calendar` 建置入口。公開元件採 Timeline 的組合方式，包含：

- `CalendarProvider`：事件、range、瀏覽日期、時區及互動設定。
- `CalendarContent`、`CalendarRangeHeader`：內容與日期標頭。
- `CalendarMonth`、`CalendarTimeGrid`：月份版面，以及 Week、Day 共用的時間格線。
- `CalendarToolbar`、`CalendarHeaderToolbar`：可組合工具列與預組工具列。
- `CalendarRangeSelect`、`CalendarJumpTo`：Calendar 專用 range 選單與前後、Today 導覽。
- `CalendarEvent` 組合元件：`Root`、`Item`、`Resize`，讓外部替換卡片內容與組合操作。
- 上述元件所需的公開 props、事件型別與 `CalendarRange`。

排版元件負責事件位置，並提供事件與分段資訊給卡片呈現介面；外部使用者不必計算欄位、top 或 height。

Provider 接收唯讀的 `events` 與操作 callbacks：`onCreate` 接收不含 ID 的起訖及全天設定，`onEventClick` 接收事件，`onEventChange` 接收事件 ID、完整的新起訖值、`allDay` 與操作原因。原因區分 move、resize-start、resize-end 及 convert。省略更新或新增 callback 時，停用對應操作；`readOnly` 一次停用所有資料修改。

事件資料由呼叫端持有，provider 只保存互動 draft。`range` 配合 `onRangeChange` 受控使用，或以 `defaultRange` 非受控使用。`timeZone`、`weekStartsOn` 與 `className` 是 provider 設定；固定 15 分鐘精度及一小時預設長度是本次預設，不額外增加設定面板。

`CalendarRangeSelect` 與既有 `TimelineRangeSelect` 都公開。底層通用 range select 等共用實作只接受內部匯入，不新增 public barrel、套件 subpath 或獨立建置入口。保留既有 Timeline UI 匯出。

現有 `@notion-kit/ui/primitives` 中的 `Calendar` 是日期選擇器，維持原用途。新增的日曆檢視使用獨立的 `@notion-kit/ui/calendar` 入口。

## 共用設定與瀏覽日期

### 持久化設定

`TableViewState.timeline` 改為 `TableViewState.dateView`。`DateViewState` 保存兩個欄位：

| 欄位 | 型別與預設 | 行為 |
| --- | --- | --- |
| `datePropertyId` | `string` 或 `null`；預設 `null` | Calendar 與 Timeline 使用同一個日期 property |
| `range` | `daily`、`weekly`、`monthly`、`quarterly`；預設 `monthly` | 切換 layout 後保留，除非目標 view 不支援 |

`PartialTableViewState` 支援部分 `dateView` 設定，並在既有 view resolution 流程補上預設值。設定更新維持現有 controlled 與 uncontrolled resource contract。

Table API 改為 `setDateViewRange`、`setDateViewDateProperty`。對應 action 改為 `view.date_view_range.change`、`view.date_view_property.change`，保留 previous、next 與 operation ID 的表達方式。

這是 Table 設定及相關 API 的直接改名。Repo 內的元件、測試、範例與文件一起遷移，不保留第二份 `timeline` 設定或雙向同步。文件記錄舊欄位與 API 的遷移方式。獨立 UI 的 `TimelineRange` 仍只有 Timeline 支援的值。

### Range 支援與 fallback

| View | 支援 range | 預設 range |
| --- | --- | --- |
| Timeline | `daily`、`monthly`、`quarterly` | `monthly` |
| Calendar | `daily`、`weekly`、`monthly` | `monthly` |

切換 layout 時，支援的 range 原樣保留。不支援時，共用 range 改成 `monthly`，瀏覽日期不變。這次 fallback 會取代舊 range；再次切回原 view 不恢復舊值。

`setTableLayout` 在同一次 view 更新中處理 layout 與 range。其 action 記錄 layout 的前後值，並在 fallback 時記錄 range 的前後值，避免中間 render 把不支援的 range 傳入 UI。

直接傳入的 controlled view，以及初始 default view，也在 resolution 時得到合法的有效 range；resolution 不靠 effect 反覆發出修正 callback。Table 與 Board 等其他 layout 不改寫這份日期設定。

### 暫存瀏覽日期

`anchorDate` 是目前瀏覽日期的毫秒 timestamp，由持續掛載的 Table view 共用 context 保存。切換 layout 或 range 不重設它；整個 Table view 重新掛載時，預設回到今天。

`anchorDate` 不放入持久化的 `dateView`，因此捲動不觸發 `onViewChange`。切換到非日期 layout 再切回時，同一個掛載中的 Table view 仍保留它。

獨立 Calendar 與 Timeline 都提供 `anchorDate`、`defaultAnchorDate` 與 `onAnchorDateChange`。受控模式由外部提供日期；非受控模式由各自的 provider 保存。Table adapter 使用受控模式。

Timeline 以扣除 sidebar 後的可視區中央日期回報瀏覽位置。卸載或切換 layout 前保留最新位置，不能遺漏尚未執行的節流更新。外部日期變更會定位時間軸；程式定位產生的 scroll 不能與外部值形成來回更新。

Calendar 顯示包含 `anchorDate` 的月、週或日。切換 range 保留原日期；前後按鈕移動一個對應期間，月份缺少原日期時縮至月底。Today 依顯示時區回到今天。

Table adapter 把選定 property 的時區傳入兩種日期 view。Timeline 既有 `startDate`、`endDate` 仍表示時間軸資料範圍，不改作瀏覽日期。定位超出該範圍的日期時，獨立 Timeline 可限制在最近可顯示位置，並回報實際日期。

## 日期 property 與事件資料

### 選取及初始化

可用日期 property 沿用現有判定：`type === "date"`、未隱藏、未刪除。Created time 與 Last edited time 不作為本次可編輯的事件來源。

優先使用共用 `datePropertyId`。該 property 失效時，依 column order 選第一個可用日期 property。

Calendar 在沒有可用 property 且未鎖定時，建立名稱唯一的 Date property，既有 rows 的日期保持空白。新增欄位與選用欄位共用 operation ID。初始化期間不重複建立欄位。

Timeline 既有「沒有可用 property 時，建立欄位並依 row metadata 初始化」的行為保留。若 Calendar 已建立空白 property，Timeline 直接使用該欄位，不再替既有空白日期補值。

鎖定時，可使用有效的 fallback property 顯示資料，但不寫回設定或建立欄位。完全沒有可用 property 時，顯示說明性空白狀態。

### Table 資料與 UI 事件分開

Table 日期繼續使用 `DateData`：`start`、`end`、`endDate`、`includeTime`。Calendar 操作保留同一個 cell 的其他資料與識別值。

公開 UI 事件型別名為 `CalendarEventData`，具有 `id`、`name`、`startAt`、`endAt` 與 `allDay`。時間欄位使用毫秒 timestamp，`endAt` 可為 `null`。每一筆 row 對應一個事件；視覺上的分段不是新資料。

UI 事件的有效結束邊界一律不包含在區間內。Table adapter 負責轉換全天日期的包含式結束日：

- 全天 `DateData` 的 9/16～9/18，轉為當地 9/16 00:00～9/19 00:00，顯示三天。
- 全天沒有結束日，UI 保留 `endAt: null`，排版時使用一天。
- 指定時間的結束值直接轉換；沒有結束時間則保留 `null`，排版時使用一小時。
- `endDate: false` 表示停用 end。若舊資料省略 `endDate` 但提供有效 end，仍接受該 end。

寫回全天事件時，將 UI 的 exclusive end 轉回前一個當地日期。所有日界線轉換使用 property 時區與日曆日運算，不使用固定 24 小時代表一天。

### 有效值、時區與日期邊界

未開啟 `includeTime` 的事件是全天事件。時區沿用日期 property 設定；獨立元件未提供時區時使用瀏覽器時區。無效時區使用 UTC，避免整個日曆無法顯示。

每週起始日沿用 `weekStartsOn`，預設星期一。

無開始日期的資料不出現在 Calendar，也不被刪除。無效 timestamp、無效的啟用中結束值，或結束早於開始的資料不參與排版。外部資料使用 Zod schema 驗證；單筆錯誤不影響其餘事件。

恰好在午夜結束的指定時間事件，不占下一天。既有零長度或短於 15 分鐘的有效事件可用最小可讀高度呈現，不自動改寫資料。15 分鐘的最短長度限制適用於互動產生的拉伸結果。

時間格線採當地 00:00～24:00 的刻度。夏令時間切換時，實際 timestamp 仍是資料真值；不存在的當地時間向前移到有效時間，重複時間的新增落點選較早的 offset。既有事件保留原 timestamp，必要時以時間提示中的 offset 區分重複時段。一天增減或全天轉換不可假設每一天恆為 24 小時。

## Calendar 版面

### 工具列與標頭

工具列左側為日期標題，右側為 range select 及 Previous、Today、Next。日期標題使用目前期間：Month 顯示年月，Week 顯示週日期範圍，Day 顯示完整日期；跨月或跨年的週標題包含必要的月份與年份。

標題、選單與按鈕沿用 Timeline 的視覺風格。Calendar 的日期標頭和工具列在垂直捲動時保持可見。今日日期使用參考圖的圓形強調，週末使用較淡背景。

### Month

月份顯示包含完整當月的 4～6 週，補齊前後月份的日期。補位日期使用較淡文字，仍可新增或移動事件。

單日事件使用卡片，有時間時顯示開始時間。跨日事件使用橫條，跨週時換行接續；卡片外觀採白底、細框、圓角與淡陰影，深色模式使用現有主題 tokens。

事件較多時增加該週高度，該週各日期格保持同高。第一版不以固定數量裁切事件，不加入「更多」收合功能。

### Week 與 Day

Week 顯示七個日期欄，Day 使用相同元件但只顯示一欄。左側為小時標籤；整點有橫向隔線，半小時線使用較淡樣式。

日期數字下方為全天區，外觀依使用者提供的第三張圖片：事件橫條跨過對應日期欄，與日期欄線對齊。全天事件較多時增加區域高度，全天區隨內容捲動，不固定占用視窗高度。

全天區下方是 24 小時時間格線。指定時間事件依開始時間和長度定位；跨午夜事件按日期分段。

### 排列與垂直捲動

日期欄平分容器剩餘寬度，Week 的小時標籤欄使用固定寬度。長標題截斷，完整名稱仍可由 accessible name 或提示取得。所有 range 都不產生水平捲動。

Calendar 使用一個垂直內容捲動容器。Month 的週列、全天區和時間格線不各自增加內層捲軸。Week、Day 初始進入時間格線時定位到當地 08:00；Today 定位到當地目前時段。這些定位不改動事件或 `anchorDate` 的日期。

Month 和全天區為跨日事件分配不重疊的橫列。時間格線將重疊事件並排，重疊判斷採不包含結束時間的區間。最小視覺高度和夏令時間重複時段造成的畫面相交也需要避讓。排列以開始位置、較長事件優先、來源順序及 ID 作為穩定判定，避免重新 render 時跳動。

Table adapter 使用搜尋、篩選後的實際 rows，不將 group headers 或彙總 rows 轉成事件。分組摺疊不隱藏日曆中的實際資料；既有 sorting 可用作相同日期事件的來源順序。Calendar 的日期拖曳不清除 sorting，也不改變 row 的手動順序。

## 事件操作與寫入

### 開啟與新增

點擊事件呼叫開啟 callback。Table adapter 使用既有 `table.openRow` 與 `rowView` 設定。

點 Month 日期格或全天空白區，建立落點當天的單日全天事件。點時間格線時，開始時間對齊 15 分鐘，建立一小時事件；若結束超過午夜，正常形成跨日事件。

Table row 與初始日期在同一次 data resource 更新中建立，不能先建立空 row 再用第二次更新補日期。Table 的 row creation API 支援初始 cell 值並提供新 row ID，既有 `addRow` 呼叫方式仍可使用。

受控 data 由外部 owner 決定是否接受。新 row 出現在 authoritative data 後才開啟資料頁；拒絕時不開啟不存在的 row，不重複新增。新資料不自動修改其他 property 來符合目前 filters。

### 移動

Month 與全天區的移動單位是日曆日。指定時間事件在 Month 移動時保留原當地開始時刻及實際長度；夏令時間改變時，結束時刻可能因保留實際長度而不同。

Week、Day 時間格線的開始落點對齊 15 分鐘，移動保留實際長度。只有開始時間的事件移動後仍沒有結束時間，視覺上的一小時不會被補寫到資料。

跨日或跨週事件的任何可見分段都能移動整個事件。拖曳保留抓取分段與原始開始日的相對偏移，不把每個分段當成新的開始日。

### 拉伸

事件的真正起點與終點提供 resize handles。被期間邊界裁切或拆段產生的中間邊界不提供把手。

Month 與全天區以天調整邊界，全天事件最短一天。Month 中指定時間事件的邊界移到新日期時保留該端原本時刻，結果仍需符合有效的最短長度。

時間格線以 15 分鐘調整邊界，最短 15 分鐘。只有開始時間的事件可使用視覺上的結束把手，拉伸後才建立真實 end 並啟用 `endDate`。

### 全天與指定時間互轉

跨區拖曳同時更新起訖值及 `includeTime`，使用一次 cell update。

| 轉換 | 結果 |
| --- | --- |
| 單日全天 → 時間格線 | 落點為開始時間，長度一小時 |
| 多日全天 → 時間格線 | 保留日期跨度，最後一天結束於落點開始時刻加一小時 |
| 指定時間 → 全天區 | 保留實際涵蓋的日期跨度，依落點改期，關閉 `includeTime` |

例如三天全天事件拖到 9/16 10:00，結果為 9/16 10:00～9/18 11:00。午夜結束的時間事件轉全天時，不把那個結束日期多算一天。原本未保存 end 的時間事件，使用其一小時顯示區間判定此次轉換的日期跨度。

轉為全天後將邊界正規化到當地日期，不保存隱藏的舊時間。再次轉成指定時間，重新套用上表規則。

### 操作生命週期與鎖定

拖曳或拉伸開始時保存來源值，在互動期間顯示 draft。放開在有效目標後才呼叫一次更新 callback；Esc、無效目標或取消不寫入。拖曳結束後抑制誤觸 click。

靠近容器上下邊緣時支援垂直自動捲動。第一版不以拖曳觸發前後月份或週的自動翻頁。切換 range、日期 property、瀏覽期間，或外部來源值在手勢中改變時，取消該手勢，避免以過期座標覆寫資料。

Controlled 模式以外部回傳資料為準。提交後不永久保留樂觀 draft；owner 拒絕變更時回到 authoritative 值。UI callbacks 表達使用者操作，UI 不負責遠端重試或錯誤通知。

鎖定時停用新增、移動、拉伸及持久化設定編輯。Previous、Today、Next、垂直捲動與事件開啟仍可使用。獨立 Calendar 透過 callback 可用性及唯讀設定表達相同能力。

工具列、日期落點與事件具備鍵盤焦點和名稱，Enter 或 Space 可啟動新增或開啟。Table 使用者也可透過資料頁的日期編輯器調整日期，不依賴拖曳作為唯一編輯方式。

## 文件與驗證

### 使用者文件與範例

新增獨立 Calendar 文件，說明組合方式、事件型別、受控瀏覽日期、時區、全天日期邊界及操作 callbacks。新增 Month、Week、Day，以及跨日和重疊事件範例。

更新 Table view 文件，加入 Calendar layout、共用 `dateView` 設定、切換範例及舊 Timeline Table API 的遷移對照。更新 Storybook、registry demos 與受影響的 Timeline 範例。

### 日期與排版驗證

驗證月份的 4～6 週、跨月、跨年、閏年、週起始日、時區及夏令時間。覆蓋全天的包含式 end 轉換、午夜結束、空 end、無效日期與最小視覺高度。

驗證跨週分段、跨日時間事件、真正起訖把手、並排重疊、相接但不重疊的事件，以及相同資料重複 render 時的排列穩定性。

### UI 與 Table 整合驗證

驗證三種 range 的開啟、新增、移動、雙端拉伸、跨區轉換、Esc 取消、失效 drop、垂直自動捲動與 click suppression。驗證鍵盤啟動、唯讀及鎖定行為。

Table 測試涵蓋日期 property 共用、fallback 和初始化，確保不重複新增 property。驗證 layout 和 range 的一次更新、直接輸入的合法化，以及瀏覽日期在兩種 view 間保留。

驗證 controlled owner 接受及拒絕更新、原子 row creation、接受後開啟 row，以及既有搜尋、篩選、排序和分組下的資料選取。

執行 UI、Table hook 與 Table view 的型別、lint 及相關測試。獨立 Calendar 和 Table Calendar 都要在真實瀏覽器檢查幾何排版、拖曳、sticky 標頭與無水平捲動；不能僅依 jsdom 推論這些結果。

既有 Timeline 的 range、定位、捲動、建立日期、拖曳和拉伸需要回歸驗證。瀏覽器測試沿用 repository fixtures 與 component objects。

### 完成條件

- 外部應用可只匯入 `@notion-kit/ui/calendar`，組合三種 range 並接收操作 callbacks。
- Calendar 與 Timeline 共用 property、range 及瀏覽日期，fallback 行為符合本文。
- Calendar 支援已確認的新增、移動、雙端拉伸與全天轉換，且操作正確寫回 Table 日期資料。
- 三種 Calendar 版面只有垂直捲動，全天卡片與時間格線符合參考樣式。
- 共用控制項保持內部實作，Calendar 專用公開元件遵循 Timeline 的匯出原則。
- 範例、API 遷移文件與上述測試完成，既有 Timeline 行為通過回歸驗證。
