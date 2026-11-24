# Ops Dashboard — 內部維運布告欄系統

一個專為內部維運團隊打造的深色主題布告欄與資訊入口網頁（Ops Dashboard），採用 **React + Ant Design** 前端與 **FastAPI + SQLModel + SQLite** 後端，完整支援 **Docker Compose**（開發／正式雙模式）與**內網離線 Kubernetes (K8s)** 部署。

---

## ✨ 功能特色

- **📢 公告管理（Announcements）**
  - 支援公告的**新增、修改、刪除（CRUD）**與分類篩選（`Maintenance`、`Urgent`、`General`、`Deployment`）。
  - 支援標記影響主機（`target_hosts`）與發布時間紀錄。
  - 針對日常維運閱讀體驗，提供**公告放大檢視**與**返回按鈕**等操作優化。
- **❓ 常見問題（FAQs）**
  - 集中整理維運常見問題與排除方式，管理員登入後可即時新增、編輯與刪除項目。
- **🔗 常用網站（Common Websites）**
  - 整合團隊常用系統與工具入口（如 Internal Wiki、Grafana、Jenkins、PagerDuty、AWS Console 等）。
- **🔐 帳號驗證與權限控管（Authentication）**
  - 實作專屬登入介面，採 **OAuth2 + JWT (`HS256`)** 搭配 **Argon2** 密碼加密。
  - 訪客可直接瀏覽公告、FAQ 與常用網站；管理員登入後解鎖新增、修改、刪除權限。
  - 後端啟動時自動檢查資料庫並建立初始管理員帳號。
- **🌙 深色主題介面（Dark Mode）**
  - 基於 Ant Design Dark Theme 建構，長時間監看與操作不易視覺疲勞。

---

## 🛠️ 技術架構

| 層級 | 技術與工具 |
| --- | --- |
| **前端（Frontend）** | React 18、Vite 5、Ant Design 5、React Router 7、Axios、Nginx |
| **後端（Backend）** | Python 3.10、FastAPI、Uvicorn、SQLModel、SQLite (`aiosqlite`)、`python-jose` (JWT)、`passlib[argon2]` |
| **容器與部署（Infra）** | Docker、Docker Compose、Kubernetes (`web_project.yaml`)、Nginx 反向代理 |

---

## 📂 專案結構

```text
web_project/
├── backend/
│   ├── Dockerfile                 # 後端映像檔：安裝依賴、設定 /data 與啟動 FastAPI (Port 8000)
│   ├── requirements.txt           # Python 套件清單
│   └── app/
│       ├── main.py                # FastAPI 進入點：設定 CORS Middleware、註冊 Router 與初始化 DB
│       ├── database.py            # 非同步 SQLite 連線設定、建表與建立初始管理員帳號
│       ├── models.py              # SQLModel 資料表與 API Schema (User, Announcement, Faq)
│       ├── auth.py                # Argon2 密碼加密、JWT 簽發與驗證邏輯
│       └── routers/
│           ├── auth.py            # 登入與 Token 核發 API (/token)
│           ├── announcements.py   # 公告 CRUD API (/announcements)
│           └── faqs.py            # 常見問題 CRUD API (/faqs)
├── frontend/
│   ├── Dockerfile                 # Multi-stage 建置：Node 打包 + Nginx 提供靜態檔與反向代理
│   ├── nginx.conf                 # SPA 路由回退與 /api 反向代理至 backend:8000
│   ├── package.json
│   └── src/
│       ├── App.jsx                # 主版面配置、深色主題與前端路由
│       ├── api.js                 # Axios 實例、Token 攔截器與所有 API 請求封裝
│       ├── contexts/
│       │   └── AuthContext.jsx    # 全域登入狀態管理
│       └── components/
│           ├── AnnouncementTable.jsx  # 公告列表、篩選、放大檢視與 CRUD 介面
│           ├── FaqPage.jsx            # FAQs 檢視與管理頁面
│           ├── CommonWebsitesPage.jsx # 常用網站入口頁面
│           └── LoginPage.jsx          # 登入頁面
├── data/                          # SQLite 資料庫本機掛載目錄 (ops_board.db)
├── .env.example                   # 環境變數範本
├── docker-compose.yml             # 預設 Compose 設定（目前為開發模式）
├── docker-compose-dev.yml         # 開發模式設定（僅啟動後端並掛載程式碼熱重載）
├── docker-compose-normal.yml      # 正式模式設定（同時啟動前後端容器）
└── web_project.yaml               # Kubernetes 部署清單 (Namespace, PV/PVC, Deployment, Service)
```

---

## ⚙️ 環境變數設定

請先於專案根目錄複製 `.env.example` 為 `.env`，並填入對應設定值：

```bash
cp .env.example .env
```

`.env` 範例內容：

```env
DEFAULT_DATABASE_URL=sqlite+aiosqlite:////data/ops_board.db
DEFAULT_ADMIN_USER=admin
DEFAULT_ADMIN_PASSWORD=your_secure_password
DEFAULT_SECRET_KEY=your_random_secret_key
```

> **說明**：`docker-compose` 會透過 `${...}` 自動讀取 `.env` 中的變數並注入後端容器。請勿將包含真實密碼與金鑰的 `.env` 提交至版本控制。

---

## 🚀 快速開始

本專案提供**開發模式**與**正式模式**兩種啟動方式，切換模式時請留意 `frontend/src/api.js` 中的 `baseURL` 設定。

### 1. 開發模式（Docker 後端 + 本機 Vite 前端）

適合日常開發與即時除錯：後端透過掛載程式碼資料夾（`./backend:/app/backend`）搭配 `--reload` 實現修改即時生效，前端則以 Vite 啟動熱更新。

1. 確認 [`frontend/src/api.js`](frontend/src/api.js) 使用本機後端位址：
   ```javascript
   const api = axios.create({
       // baseURL: '/api', // Production (Nginx reverse proxy)
       baseURL: 'http://localhost:8000', // Dev mode
   });
   ```
2. 啟動後端容器（Port 映射為 `本機:容器` = `8000:8000`）：
   ```bash
   docker compose -f docker-compose-dev.yml up --build
   ```
3. 開啟另一個終端機啟動前端開發伺服器：
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 2. 正式模式（Docker Compose 同時啟動前後端）

透過 `docker-compose-normal.yml` 一次啟動 `backend` 與 `frontend` 兩個服務（`frontend` 設定 `depends_on: backend`，並由容器內的 Nginx 處理 `/api/` 反向代理轉發至 `http://backend:8000`）。

1. 將 [`frontend/src/api.js`](frontend/src/api.js) 的 `baseURL` 切換為相對路徑：
   ```javascript
   const api = axios.create({
       baseURL: '/api', // Use relative path for reverse proxy
       // baseURL: 'http://localhost:8000', // Dev mode
   });
   ```
2. 建置並啟動前後端服務（前端對外開放 `8080:80`）：
   ```bash
   docker compose -f docker-compose-normal.yml up -d --build
   ```
3. 開啟瀏覽器造訪 `http://localhost:8080`。

> **資料持久化說明**：`volumes` 將本機 `./data` 掛載至容器內的 `/data`，確保容器重啟後 SQLite 資料庫（`ops_board.db`）資料不會遺失；亦可依需求改為 Docker Managed Volume。

---

## ☸️ 內網 Kubernetes (K8s) 離線部署

針對無法連外網的企業內網 K8s 叢集，部署流程如下：

### 1. 確認前端 API 路徑並建置 Image
確保 `frontend/src/api.js` 的 `baseURL` 已設為 `'/api'`，接著分別建置前後端映像檔並匯出成 `.tar` 壓縮檔：

```bash
docker build -t web_project-backend:v1 ./backend
docker build -t web_project-frontend:v1 ./frontend

docker save -o backend_v1.tar web_project-backend:v1
docker save -o frontend_v1.tar web_project-frontend:v1
```

### 2. 傳入內網節點並匯入 Image
將 `.tar` 檔案傳輸至內網 K8s 節點後匯入（依節點使用的 Container Runtime 選擇對應指令）：

```bash
# 若使用 containerd (常見於新版 K8s)
sudo ctr -n k8s.io images import backend_v1.tar
sudo ctr -n k8s.io images import frontend_v1.tar

# 或使用 docker
docker load -i backend_v1.tar
docker load -i frontend_v1.tar
```

> **⚠️ Image 路徑注意事項**：`ctr` 匯入本地 Image 時通常會帶有 `docker.io/library/` 前綴，因此 [`web_project.yaml`](web_project.yaml) 中已明確指定 `image: docker.io/library/web_project-backend:v1` 與 `imagePullPolicy: Never`，確保 K8s 僅使用本地匯入的 Image 而不會嘗試連網拉取。

### 3. 準備節點資料目錄並套用 YAML
由於 SQLite 資料庫採用 `hostPath` 持久化並透過 `nodeSelector` 鎖定在指定節點（[`web_project.yaml`](web_project.yaml) 中的 `<YOUR_NODE_HOSTNAME>`），請先在該節點建立對應目錄：

```bash
sudo mkdir -p /data/ops-dashboard-db
```

接著套用 K8s 設定檔：

```bash
kubectl apply -f web_project.yaml
```

### 4. 內網防火牆與 Nginx 80 Port 轉發
`web_project.yaml` 預設透過 NodePort `30080` 對外暴露前端服務。由於內網環境通常會封鎖 `30080` 等非常規 Port，可在入口主機上透過 **Nginx** 監聽標準 `80` Port，將請求反向代理轉發至 K8s 節點的 `30080` Port，讓使用者能直接透過一般 HTTP 網址存取。

```nginx
server {
    listen 80;
    server_name ops-dashboard.internal;

    location / {
        proxy_pass http://<K8S_NODE_IP>:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📡 API 端點一覽

後端預設於 Port `8000` 提供 RESTful API（開發模式下可造訪 `http://localhost:8000/docs` 查看 Swagger 文件）：

| 方法 | 路徑 | 說明 | 需要驗證 |
| --- | --- | --- | :---: |
| `POST` | `/token` | 登入取得 JWT Access Token | ❌ |
| `GET` | `/announcements/` | 取得公告列表（支援 `?category=` 篩選） | ❌ |
| `POST` | `/announcements/` | 新增公告 | ✅ |
| `PATCH` | `/announcements/{id}` | 修改公告 | ✅ |
| `DELETE` | `/announcements/{id}` | 刪除公告 | ✅ |
| `GET` | `/faqs/` | 取得啟用中的 FAQ 列表 | ❌ |
| `POST` | `/faqs/` | 新增 FAQ | ✅ |
| `PATCH` | `/faqs/{id}` | 修改 FAQ | ✅ |
| `DELETE` | `/faqs/{id}` | 刪除 FAQ | ✅ |

---

## 🤖 AI 協作開發流程

本專案採用 **Gemini + Antigravity** 雙工具協作模式完成開發：

1. **需求與架構討論（Gemini）**：向 Gemini 描述實際維運使用情境與痛點，討論架構設計並產出明確的實作 Prompt。
2. **統一程式碼產出（Antigravity）**：將整理好的 Prompt 交付給 Antigravity 執行程式碼撰寫、檔案建立與設定調整，確保所有程式碼由單一來源一致產出。
3. **驗證與回饋迭代**：將執行結果與使用體驗回饋給 Gemini 尋求優化建議（例如登入流程、返回按鈕、公告放大檢視、容器化與 K8s 離線部署排錯），再轉為精準 Prompt 交由 Antigravity 迭代修正。
