# HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN (HOTEL BOOKING SYSTEM) - ĐỀ 6

**Học phần:** Triển khai & Quản trị Hệ thống Phần mềm  
**Cơ sở đào tạo:** Trường Đại học Công nghệ Thông tin & Truyền thông - Đại học Thái Nguyên (ICTU)  
**Sinh viên thực hiện:** Nguyễn Hoàng Việt  
**Mã số sinh viên (MSSV):** DTC245200384  
**Hạ tầng:** Localhost (Docker Desktop / Docker Compose trên máy trạm)  
**Địa chỉ truy cập chính:** `http://localhost:3001`  
**Mạng Docker liên thông:** `novera_network` (Bridge Network)  

---

## 1. TỔNG QUAN HỆ THỐNG

Dự án triển khai một hệ thống **Đặt phòng Khách sạn Chuẩn Doanh nghiệp (Enterprise Hotel Booking System)** gồm các phân hệ nghiệp vụ, cơ sở dữ liệu quan hệ, cổng điều hướng bảo mật và cụm quan sát (Observability) trên môi trường Docker Localhost:

- **Ứng dụng nghiệp vụ**:
  - **Cổng Khách hàng (Guest Portal)**: Tìm kiếm buồng phòng theo khoảng ngày nhận/trả phòng, lọc theo sức chứa, hạng phòng, quy trình đặt phòng 3 bước trực quan, tự động cấp mã đặt chỗ (Voucher Code NVH-xxxx) và tra cứu tình trạng đơn.
  - **Cổng Quản trị (Admin Console)**: Theo dõi thời gian thực KPI (Tỷ lệ lấp đầy phòng - Occupancy Rate %, Doanh thu tích lũy, Số khách đang lưu trú), Sơ đồ buồng phòng phân tầng (Room Matrix) và Bảng quản lý đơn đặt phòng (Check-in, Check-out, Hủy đơn).
  - **Thuật toán Chống Trùng Lịch (Anti-Overbooking Engine)**: Sử dụng PostgreSQL Transaction kết hợp **Pessimistic Locking (`SELECT ... FOR UPDATE`)**, đảm bảo không xảy ra xung đột đặt trùng phòng khi có nhiều yêu cầu đồng thời.
- **Cơ sở dữ liệu**: PostgreSQL 16 (chuẩn hóa 3NF+, khóa ngoại, check constraints, indexes tối ưu) tương thích Supabase.
- **Reverse Proxy Gateway**: Nginx Ingress điều phối lưu lượng, tích hợp Rate Limiting, gzip, và bộ tiêu chuẩn Security Hardening Headers.
- **Hệ thống Giám sát & Quan sát (Observability Stack)**:
  - **Prometheus**: Thu thập RED metrics từ Backend (`/metrics` qua thư viện `prom-client`) và số liệu tài nguyên máy chủ.
  - **Grafana**: Dashboard trực quan theo dõi toàn diện hiệu năng API (RPS, p95/p99 Latency), tỷ lệ lấp đầy buồng phòng và live stream logs từ Loki.
  - **Loki & Promtail**: Thu thập nhật ký container tập trung, truy vấn theo cú pháp LogQL.

---

## 2. KIẾN TRÚC & PHÂN BỔ DỊCH VỤ TRÊN LOCALHOST

| Dịch vụ | Tên Container | Cổng Nội Bộ | Cổng Truy Cập Localhost | Chức Năng |
| :--- | :--- | :--- | :--- | :--- |
| **Giao diện Khách & Admin** | `hotel-frontend` | 80 | `http://localhost:3001` | Ứng dụng React SPA (Vite + Tailwind CSS) |
| **Backend REST API** | `hotel-backend` | 5000 | `http://localhost:5000` | REST API Node.js Express, metrics `/metrics` |
| **Prometheus Server** | `hotel-prometheus` | 9090 | `http://localhost:9090` | Thu thập và lưu trữ time-series metrics |
| **Grafana Dashboard** | `hotel-grafana` | 3000 | `http://localhost:3000` | Trực quan hóa Dashboard RED/USE, KPIs & Logs |
| **Grafana Loki** | `hotel-loki` | 3100 | `http://localhost:3100` | Hệ thống quản lý và lập chỉ mục log tập trung |
| **Promtail Log Agent** | `hotel-promtail` | 9080 | Nội bộ Docker | Agent đọc log từ Docker socket chuyển về Loki |
| **Node Exporter** | `hotel-node-exporter` | 9100 | `http://localhost:9100` | Thu thập chỉ số tài nguyên phần cứng máy chủ |
| **PostgreSQL Database** | `hotel-postgres` | 5432 | `127.0.0.1:5432` | CSDL lưu trữ `hotel_db` (chuẩn hóa 3NF+) |

---

## 3. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG TRÊN LOCALHOST

### Yêu cầu tiên quyết
- Máy trạm đã cài đặt và đang mở Docker Desktop.

### Bước 1: Khởi tạo tệp cấu hình môi trường
Sao chép tệp cấu hình mẫu sang `.env` (hoặc sử dụng tệp `.env` đã được sinh):
```bash
cp .env.example .env
```

### Bước 2: Khởi động toàn bộ cụm dịch vụ
Khởi chạy toàn bộ hệ thống bằng Docker Compose (Cơ sở dữ liệu sẽ tự động nạp cấu trúc bảng `schema.sql` và dữ liệu mẫu `seed.sql`):
```bash
docker compose up -d --build
```

### Bước 3: Kiểm tra trạng thái các container
```bash
docker compose ps
```
Đảm bảo tất cả các container đều ở trạng thái `running` (hoặc `healthy` đối với cơ sở dữ liệu).

---

## 4. XÁC MINH CÁC TIÊU CHÍ KỸ THUẬT

### 1. Kiểm tra API Health & Kết nối Database
```bash
curl -s http://localhost:5000/health
```
Phản hồi mẫu:
```json
{"status":"UP","service":"hotel-backend","database":"CONNECTED"}
```

### 2. Kiểm tra Prometheus Scrape Targets
```bash
curl -s http://localhost:9090/api/v1/targets
```
Các targets (`hotel-backend`, `hotel-node-exporter` và `prometheus`) đều ở trạng thái `UP`.

### 3. Kiểm tra Grafana Dashboard
Truy cập qua trình duyệt: `http://localhost:3000/`
- Đăng nhập bằng tài khoản và mật khẩu quản trị được thiết lập trong `.env`.
- Dashboard sẵn có được provisioning tự động:
  - **🖥️ Giám Sát Hệ Thống - System Monitoring** (`/d/hotel-system-monitoring/`)
  - **Novera Luxury Hotel - Giám Sát Toàn Diện** (`/d/hotel-business-kpis/`)

### 4. Kiểm tra Truy vấn LogQL (Loki)
1. **Truy vấn 1: Log hoàn thành yêu cầu HTTP**:
```logql
{job="docker"} |= "HTTP Request Completed"
```
2. **Truy vấn 2: Log lỗi hoặc ngoại lệ**:
```logql
{job="docker"} |~ "(?i)(error|exception|failed)"
```
3. **Truy vấn 3: Log kiểm toán nghiệp vụ đặt phòng**:
```logql
{job="docker"} |= "[BOOKING_AUDIT]"
```

---

## 5. CÁC BIỆN PHÁP HARDENING ĐÃ ÁP DỤNG

1. **Non-Root Container**: Container `hotel-backend` chạy dưới user `appuser` (UID 10001), hạn chế leo thang đặc quyền.
2. **Network Isolation**: Tách biệt mạng `hotel_internal` và mạng `novera_network`. CSDL không bind mở ra mạng ngoài trái phép.
3. **Nginx Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `server_tokens off`.
4. **Rate Limiting**: Giới hạn tốc độ request cho API chung và endpoint tạo booking nhằm ngăn chặn hành vi spam và bot.
5. **Secret Management**: Toàn bộ mật khẩu và thông tin nhạy cảm lưu trong `.env`, loại trừ triệt để khỏi Git bằng `.gitignore`.
