INSERT INTO room_types (code, name, base_price_vnd, capacity_adults, capacity_children, description, amenities, image_url) VALUES
('STD', 'Standard City View', 850000, 2, 1, 'Phòng tiêu chuẩn ấm cúng hướng phố, trang bị giường Queen êm ái, phù hợp cho cặp đôi hoặc chuyến công tác ngắn ngày.', '["Wifi tốc độ cao", "Điều hòa 2 chiều", "TV 43 inch", "Máy sấy tóc", "Trà/Cà phê miễn phí"]'::jsonb, '/images/room-std.jpg'),
('SUP', 'Superior Garden View', 1250000, 2, 1, 'Phòng cao cấp ngập tràn ánh sáng tự nhiên với ban công ngắm nhìn hoa viên xanh mát, không gian thoáng đãng.', '["Ban công riêng", "Bồn tắm nằm", "Wifi tốc độ cao", "Minibar", "Áo choàng tắm", "Két sắt an toàn"]'::jsonb, '/images/room-sup.jpg'),
('DLX', 'Deluxe Ocean Panorama', 1950000, 3, 2, 'Phòng hạng sang có cửa kính vòm mở rộng tầm nhìn toàn cảnh biển, sofa thư giãn sang trọng và giường King cao cấp.', '["View toàn cảnh biển", "Giường King cỡ lớn", "Bồn tắm Jacuzzi", "Máy pha cà phê Nespresso", "Bữa sáng buffet"]'::jsonb, '/images/room-dlx.jpg'),
('SUT', 'Executive Suite Luxury', 3200000, 4, 2, 'Căn hộ Suite thượng lưu phân chia phòng khách và phòng ngủ riêng biệt, nội thất gỗ óc chó tinh xảo và tiện ích VIP.', '["Phòng khách riêng", "Bàn làm việc doanh nhân", "Dịch vụ quản gia 24/7", "Check-in sớm/muộn", "Lối vào Executive Lounge"]'::jsonb, '/images/room-sut.jpg'),
('PRS', 'Presidential Royal Suite', 6800000, 6, 3, 'Dinh thự trên cao đỉnh cao vương giả, tầm nhìn 360 độ, phòng ăn riêng, quầy bar cá nhân và hệ thống âm thanh vòm cao cấp.', '["2 Phòng ngủ Master", "Bếp & Phòng ăn riêng", "Rạp chiếu phim mini", "Bảo vệ riêng", "Đưa đón xe Limousine"]'::jsonb, '/images/room-prs.jpg')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rooms (room_number, room_type_id, floor, status, notes) VALUES
('P.101', 1, 1, 'AVAILABLE', 'Gần sảnh chính và khu vực đón trả khách'),
('P.102', 1, 1, 'AVAILABLE', 'Yên tĩnh, phù hợp nghỉ ngơi'),
('P.103', 1, 1, 'OCCUPIED', 'Khách check-in sáng nay'),
('P.104', 2, 1, 'AVAILABLE', 'Hướng hoa viên nội khu'),
('P.105', 2, 1, 'MAINTENANCE', 'Bảo dưỡng định kỳ hệ thống máy lạnh'),
('P.201', 1, 2, 'AVAILABLE', 'Tầm nhìn thoáng đãng'),
('P.202', 2, 2, 'AVAILABLE', 'Có ban công hoa giấy'),
('P.203', 2, 2, 'OCCUPIED', 'Khách gia đình 3 người'),
('P.204', 3, 2, 'AVAILABLE', 'Góc nhìn biển trực diện'),
('P.205', 3, 2, 'AVAILABLE', 'Đầy đủ tiện nghi cao cấp'),
('P.301', 2, 3, 'AVAILABLE', 'Gần thang máy tầng 3'),
('P.302', 3, 3, 'AVAILABLE', 'Không gian yên tĩnh tuyệt đối'),
('P.303', 3, 3, 'OCCUPIED', 'Khách lưu trú 4 đêm'),
('P.304', 4, 3, 'AVAILABLE', 'Suite doanh nhân cao cấp'),
('P.305', 4, 3, 'AVAILABLE', 'Suite gia đình sang trọng'),
('P.401', 3, 4, 'AVAILABLE', 'Tầng cao gió lộng'),
('P.402', 4, 4, 'AVAILABLE', 'Executive Suite hướng biển'),
('P.403', 4, 4, 'OCCUPIED', 'Đoàn chuyên gia nước ngoài'),
('P.404', 4, 4, 'AVAILABLE', 'Nội thất vừa được làm mới'),
('P.405', 5, 4, 'AVAILABLE', 'Phòng Tổng thống độc bản')
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO customers (full_name, id_card, phone, email, address) VALUES
('Lường Minh Hiếu', '019200008853', '0988776655', 'hieu.luong@noveratech.digital', 'TP. Thái Nguyên, Thái Nguyên'),
('Nguyễn Hoàng Nam', '001201004567', '0912345678', 'nam.nguyen@gmail.com', 'Hoàn Kiếm, Hà Nội'),
('Trần Thị Mai', '079198009876', '0933221100', 'mai.tran@yahoo.com', 'Quận 1, TP. Hồ Chí Minh'),
('Lê Văn Quân', '048202001122', '0977889900', 'quan.le@techcorp.vn', 'Hải Châu, Đà Nẵng')
ON CONFLICT DO NOTHING;

INSERT INTO bookings (booking_code, customer_id, check_in_date, check_out_date, total_price_vnd, status, special_requests) VALUES
('NVH-2026-001', 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 5850000, 'CHECKED_IN', 'Yêu cầu phòng tầng cao, giường không mùi'),
('NVH-2026-002', 2, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 2550000, 'CHECKED_IN', 'Hỗ trợ check-in sớm lúc 10h sáng'),
('NVH-2026-003', 3, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 3750000, 'CHECKED_IN', 'Cần thêm 1 nôi em bé'),
('NVH-2026-004', 4, CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days', 12800000, 'CHECKED_IN', 'Hóa đơn đỏ VAT doanh nghiệp')
ON CONFLICT (booking_code) DO NOTHING;

INSERT INTO booking_rooms (booking_id, room_id, price_per_night) VALUES
(1, 10, 1950000),
(2, 3, 850000),
(3, 8, 1250000),
(4, 18, 3200000)
ON CONFLICT DO NOTHING;
