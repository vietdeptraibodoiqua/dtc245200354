# HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN (HOTEL BOOKING SYSTEM) - ĐỀ 6

**Học phần:** Triển khai & Quản trị Hệ thống Phần mềm  
**Cơ sở đào tạo:** Trường Đại học Công nghệ Thông tin & Truyền thông - Đại học Thái Nguyên (ICTU)  
**Sinh viên thực hiện:** Lường Minh Hiếu  
**Mã số sinh viên (MSSV):** DTC245200853  
**Hạ tầng:** VPS Ubuntu Server  
**Tên miền chính thức:** `https://hotel.noveratech.digital`  
**Mạng Docker liên thông:** `novera_network`  

---

## 1. TỔNG QUAN HỆ THỐNG

Dự án triển khai một hệ thống **Đặt phòng Khách sạn Chuẩn Doanh nghiệp (Enterprise Hotel Booking System)** gồm các phân hệ nghiệp vụ, cơ sở dữ liệu quan hệ, cổng điều hướng bảo mật và cụm quan sát (Observability):

- **Ứng dụng nghiệp vụ**:
  - **Cổng Khách hàng (Guest Portal)**: Tìm kiếm buồng phòng theo khoảng ngày nhận/trả phòng, lọc theo sức chứa, hạng phòng, quy trình đặt phòng 3 bước trực quan, tự động cấp mã đặt chỗ (Voucher Code) và tra cứu tình trạng đơn.
  - **Cổng Quản trị (Admin Console)**: Theo dõi thời gian thực KPI (Tỷ lệ lấp đầy phòng - Occupancy Rate %, Doanh thu tích lũy, Số khách đang lưu trú), Sơ đồ buồng phòng phân tầng (Room Matrix) và Bảng quản lý đơn đặt phòng (Check-in, Check-out, Hủy đơn).
  - **Thuật toán Chống Trùng Lịch (Anti-Overbooking Engine)**: Sử dụng PostgreSQL Transaction kết hợp **Pessimistic Locking (`SELECT ... FOR UPDATE`)**, đảm bảo không xảy ra xung đột đặt trùng phòng khi có nhiều yêu cầu đồng thời.
- **Cơ sở dữ liệu**: PostgreSQL 16 (chuẩn hóa 3NF+, khóa ngoại, check constraints, indexes tối ưu) tương thích Supabase.
- **Reverse Proxy Gateway**: Nginx Ingress điều phối tên miền `hotel.noveratech.digital`, tích hợp Rate Limiting, gzip, và bộ tiêu chuẩn Security Hardening Headers.
- **Hệ thống Giám sát & Quan sát (Observability Stack)**:
  - **Prometheus**: Thu thập RED metrics từ Backend (`/metrics` qua thư viện `prom-client`) và số liệu máy chủ.
  - **Grafana**: Dashboard trực quan theo dõi toàn diện hiệu năng API (RPS, p95/p99 Latency), tỷ lệ lấp đầy buồng phòng và live stream logs từ Loki.
  - **Loki & Promtail**: Thu thập nhật ký container tập trung, truy vấn theo cú pháp LogQL.

---

## 2. KIẾN TRÚC & PHÂN BỔ DỊCH VỤ

| Dịch vụ | Tên Container | Cổng Nội Bộ | Cổng Mở Host / Gateway | Chức Năng |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Ingress** | Host Nginx | 80/443 | `https://hotel.noveratech.digital/` | Cổng vào Ingress, Reverse Proxy & Security Hardening |
| **Giao diện Khách & Admin** | `hotel-frontend` | 80 | `127.0.0.1:3001` | Ứng dụng React SPA (Vite + Tailwind CSS) |
| **Backend REST API** | `hotel-backend` | 5000 | `127.0.0.1:5000` | REST API Node.js Express, metrics `/metrics` |
| **Prometheus Server** | `hotel-prometheus` | 9090 | `127.0.0.1:9090` | Thu thập và lưu trữ time-series metrics |
| **Grafana Dashboard** | `hotel-grafana` | 3000 | `127.0.0.1:3000` | Trực quan hóa chỉ số RED/USE và log stream |
| **Grafana Loki** | `hotel-loki` | 3100 | `127.0.0.1:3100` | Hệ thống quản lý và lập chỉ mục log tập trung |
| **Promtail Log Agent** | `hotel-promtail` | - | - | Agent đọc log từ Docker socket chuyển về Loki |
| **PostgreSQL Database** | `ats-postgres` | 5432 | Mạng nội bộ `ats-postgres:5432` | CSDL lưu trữ `hotel_db` (Supabase compatible) |

---

## 3. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Yêu cầu tiên quyết
- Máy chủ Linux hoặc macOS/Windows đã cài đặt Docker và Docker Compose.
- Mạng Docker `novera_network` (nếu chưa có, tạo bằng lệnh: `docker network create novera_network`).

### Bước 1: Khởi tạo biến môi trường
Sao chép tệp mẫu sang `.env`:
```bash
cp .env.example .env
```

### Bước 2: Nạp dữ liệu cơ sở dữ liệu
```bash
docker exec -i ats-postgres psql -U postgres -d hotel_db < database/schema.sql
docker exec -i ats-postgres psql -U postgres -d hotel_db < database/seed.sql
```

### Bước 3: Khởi động cụm dịch vụ
```bash
docker compose up -d --build
```

### Bước 4: Kiểm tra trạng thái
```bash
docker compose ps
```

---

## 4. XÁC MINH CÁC TIÊU CHÍ KỸ THUẬT

### 1. Kiểm tra API Health & Kết nối Database
```bash
curl -s http://127.0.0.1:5000/health
```
Phản hồi mẫu:
```json
{"status":"UP","timestamp":"2026-10-21T02:29:39.773Z","service":"hotel-backend","database":"CONNECTED"}
```

### 2. Kiểm tra Prometheus Scrape Targets
```bash
curl -s http://127.0.0.1:9090/api/v1/targets
```
Cả 2 targets (`hotel-backend` và `prometheus`) đều ở trạng thái `UP`.

### 3. Kiểm tra Grafana Dashboard
Truy cập qua URL: `https://hotel.noveratech.digital/grafana/`
- Tài khoản: `admin`
- Mật khẩu: `AdminSecure2026!`
- Dashboard sẵn có: **Novera Luxury Hotel - Giám Sát Toàn Diện** (thư mục: *Khách Sạn Novera*).

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
2. **Network Isolation**: Tách biệt mạng `hotel_internal` và mạng ngoài `novera_network`. CSDL không bind mở ra ngoài Internet.
3. **Nginx Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `server_tokens off`.
4. **Rate Limiting**: Giới hạn 20 request/giây cho API chung và 5 request/giây cho endpoint tạo booking.
5. **Secret Management**: Toàn bộ mật khẩu và thông tin nhạy cảm lưu trong `.env`, không commit vào Git.
