-- ════════════════════════════════════════════════
-- SUPABASE SETUP — Chạy trong SQL Editor
-- ════════════════════════════════════════════════

-- 1. Bảng cấu hình thiệp (1 row duy nhất, id=1)
CREATE TABLE IF NOT EXISTS wedding_config (
  id          INT DEFAULT 1 PRIMARY KEY,
  -- Cặp đôi
  bride       TEXT DEFAULT 'Bảo Ngân',
  groom       TEXT DEFAULT 'Viết Định',
  wedding_date TEXT DEFAULT '26.04.2026',
  wedding_day  TEXT DEFAULT 'Thứ Hai',
  wedding_time TEXT DEFAULT '10:00 SA',
  lunar_date   TEXT DEFAULT 'Ngày 09 tháng 03 năm Bính Ngọ',
  -- Địa điểm
  venue_name    TEXT DEFAULT 'Nhà hàng tiệc cưới',
  venue_address TEXT DEFAULT '123 Đường ABC, TP. Huế',
  venue_map_url TEXT DEFAULT 'https://maps.google.com',
  -- Phụ huynh
  parent_groom_label TEXT DEFAULT 'Nhà Trai',
  parent_groom_names TEXT DEFAULT 'Ông : Nguyễn Văn A\nBà : Trần Thị B',
  parent_groom_addr  TEXT DEFAULT 'Phường ABC, TP. Huế',
  parent_bride_label TEXT DEFAULT 'Nhà Gái',
  parent_bride_names TEXT DEFAULT 'Ông : Lê Văn C\nBà : Phạm Thị D',
  parent_bride_addr  TEXT DEFAULT 'Phường XYZ, TP. Huế',
  -- 2 Lễ
  ceremony1_label TEXT DEFAULT 'Lễ Gia Tiên Nhà Trai',
  ceremony1_time  TEXT DEFAULT '07:30 SA - Thứ Hai',
  ceremony1_date  TEXT DEFAULT '27 . 04 . 2026',
  ceremony1_lunar TEXT DEFAULT 'Nhằm 10/03 Âm lịch',
  ceremony1_place TEXT DEFAULT 'Tại tư gia Nhà Trai',
  ceremony1_addr  TEXT DEFAULT 'Phường ABC, TP. Huế',
  ceremony2_label TEXT DEFAULT 'Lễ Cưới',
  ceremony2_time  TEXT DEFAULT '10:00 SA - Thứ Hai',
  ceremony2_date  TEXT DEFAULT '26 . 04 . 2026',
  ceremony2_lunar TEXT DEFAULT 'Nhằm 09/03 Âm lịch',
  ceremony2_place TEXT DEFAULT 'Tại nhà hàng',
  ceremony2_addr  TEXT DEFAULT 'Phường XYZ, TP. Huế',
  -- Nội dung
  sec_invite_title TEXT DEFAULT 'Thư Mời',
  sec_invite_sub   TEXT DEFAULT 'THAM DỰ LỄ THÀNH HÔN CÙNG GIA ĐÌNH CHÚNG TÔI',
  sec_invite_body  TEXT DEFAULT 'Chúng tôi trân trọng kính mời Quý gia đình...',
  sec_cal_title    TEXT DEFAULT 'Thư Mời',
  sec_cal_sub      TEXT DEFAULT 'THAM DỰ TIỆC MỪNG CÙNG GIA ĐÌNH CHÚNG TÔI',
  mong_text        TEXT DEFAULT 'Rất mong được mọi người chung vui trong ngày hạnh phúc này',
  -- Quotes
  quote1 TEXT DEFAULT 'Anh về hái lấy buồng cau...',
  quote2 TEXT DEFAULT 'Có lẽ thế gian này có vô vàn điều tươi đẹp...',
  quote3 TEXT DEFAULT 'Khoảnh khắc gặp được em...',
  quote4 TEXT DEFAULT 'Hôn nhân là chuyện cả đời...',
  quote5 TEXT DEFAULT 'With love ♥',
  -- QR mừng cưới
  qr_groom_bank TEXT DEFAULT 'Vietcombank',
  qr_groom_num  TEXT DEFAULT '0123 456 789',
  qr_groom_name TEXT DEFAULT 'NGUYEN VIET DINH',
  qr_groom_img  TEXT DEFAULT '',
  qr_bride_bank TEXT DEFAULT 'Vietcombank',
  qr_bride_num  TEXT DEFAULT '9876 543 210',
  qr_bride_name TEXT DEFAULT 'TRAN BAO NGAN',
  qr_bride_img  TEXT DEFAULT '',
  -- Ảnh (Google Drive links)
  hero_img     TEXT DEFAULT '',
  couple_img   TEXT DEFAULT '',
  photo_large  TEXT DEFAULT '',
  photo_sm1    TEXT DEFAULT '',
  photo_sm2    TEXT DEFAULT '',
  photo_wide1  TEXT DEFAULT '',
  photo_wide2  TEXT DEFAULT '',
  photo_pair1  TEXT DEFAULT '',
  photo_pair2  TEXT DEFAULT '',
  photo_full   TEXT DEFAULT '',
  -- Gallery (JSON array [{url, caption}])
  gallery      JSONB DEFAULT '[]',
  -- Nhạc YouTube
  music_youtube TEXT DEFAULT '',
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng RSVP
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  attending    BOOLEAN NOT NULL,
  guests_count INT DEFAULT 1,
  message      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE wedding_config  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses  ENABLE ROW LEVEL SECURITY;

-- Cho phép anonymous đọc config (để thiệp hiển thị)
CREATE POLICY "public read config"
  ON wedding_config FOR SELECT TO anon USING (true);

-- Cho phép anonymous cập nhật config (để admin lưu — chỉ cần nếu ko dùng service role)
CREATE POLICY "public update config"
  ON wedding_config FOR ALL TO anon USING (true) WITH CHECK (true);

-- Cho phép anonymous gửi RSVP
CREATE POLICY "public insert rsvp"
  ON rsvp_responses FOR INSERT TO anon WITH CHECK (true);

-- Cho phép anonymous đọc RSVP (để admin xem)
CREATE POLICY "public select rsvp"
  ON rsvp_responses FOR SELECT TO anon USING (true);

-- Cho phép anonymous xóa RSVP (để admin xóa)
CREATE POLICY "public delete rsvp"
  ON rsvp_responses FOR DELETE TO anon USING (true);

-- 4. Insert row mặc định
INSERT INTO wedding_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════
-- XONG! Copy URL + anon key vào .env.local
-- ════════════════════════════════════════════════
