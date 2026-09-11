# 第三章：工程 RFI 資訊需求單與審查模組規格

## 1. 模組目標
標準化工程專案中之資訊需求（Request For Information, RFI），解決圖面不清、規格疑義、工期與造價變更等問題，落實審查權責與正式裁決。

## 2. 資料結構規格

### 2.1 RFI 實體
- `id` (string): 系統內部識別碼（格式：`rfi-<uuid>`）
- `rfiNumber` (string): 正式單號，格式為 `RFI-YYYY-XXX`（例如 `RFI-2026-001`）
- `title` (string): 疑義主題
- `category` (enum):
  - `'design_change'`: 設計變更
  - `'spec_query'`: 規格疑義
  - `'schedule_impact'`: 工期影響
  - `'cost_impact'`: 造價影響
- `question` (string): 提報問題詳情
- `officialAnswer` (string, optional): 官方正式審查回覆
- `answeredBy` (string, optional): 回覆審批人之 User ID
- `answeredAt` (string, ISO, optional): 回覆時間戳
- `status` (enum):
  - `'draft'`: 草稿
  - `'submitted'`: 已送審
  - `'under_review'`: 審核中
  - `'answered'`: 已答覆
  - `'closed'`: 已結案
- `raisedBy` (string): 提報人之 User ID
- `assignedTo` (string): 指定審核人員之 User ID
- `dueDate` (string, ISO YYYY-MM-DD): 截止日期
- `requiredResponseDate` (string, ISO YYYY-MM-DD): 要求答覆日期
- `linkedCardId` (string, optional): 關聯看板任務卡片
- `attachments` (Attachment[]): 隨單佐證文件或圖面
- `thread` (RfiThreadMessage[]): 討論歷程紀錄

### 2.2 討論串留言 (RfiThreadMessage)
- `id` (string): 留言識別碼
- `userId` (string): 發言者 ID
- `message` (string): 內容
- `timestamp` (string, ISO)
- `isOfficial` (boolean, optional): 是否標註為官方正式決議
- `attachments` (Attachment[], optional): 留言附帶檔案

## 3. 業務流程與權限規範
1. **提出 RFI**：
   - 任何成員均可草擬並送審 RFI，並指定專案主管 (`assignedTo`) 進行裁決。
2. **審查與正式裁決**：
   - 僅審查人或具備 `pm` / `admin` 角色者可提交 `officialAnswer` 並轉為 `answered`。
   - 裁決完成後自動發送通知通知提報人。
3. **結案流程**：
   - 經雙方確認疑義釐清後，將狀態變更為 `closed`。
4. **與看板任務雙向串接**：
   - 在卡片編輯視窗中可直接關聯既有 RFI 或直接建立新 RFI。
   - 在 RFI 視窗中可一鍵跳轉至關聯任務卡片。
