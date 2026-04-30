-- ════════════════════════════════════════════════════════
-- SUPABASE SETUP v2 — An toàn, chạy nhiều lần không lỗi
-- Đầy đủ tất cả cột cần thiết
-- ════════════════════════════════════════════════════════

-- ── 1. Bảng wedding_config ──
CREATE TABLE IF NOT EXISTS wedding_config (
  id INT DEFAULT 1 PRIMARY KEY
);

-- Thêm từng cột (IF NOT EXISTS để không lỗi khi chạy lại)
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS bride           TEXT DEFAULT 'Bảo Ngân';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS groom           TEXT DEFAULT 'Viết Định';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS wedding_date    TEXT DEFAULT '26.04.2026';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS wedding_day     TEXT DEFAULT 'Thứ Hai';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS wedding_time    TEXT DEFAULT '10:00 SA';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS lunar_date      TEXT DEFAULT 'Ngày 09 tháng 03 năm Bính Ngọ';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS venue_name      TEXT DEFAULT 'Nhà hàng tiệc cưới';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS venue_address   TEXT DEFAULT '123 Đường ABC, TP. Huế';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS venue_map_url   TEXT DEFAULT 'https://maps.google.com';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_groom_label TEXT DEFAULT 'Nhà Trai';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_groom_names TEXT DEFAULT 'Ông : Nguyễn Văn A';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_groom_addr  TEXT DEFAULT 'Phường ABC, TP. Huế';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_bride_label TEXT DEFAULT 'Nhà Gái';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_bride_names TEXT DEFAULT 'Ông : Lê Văn C';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS parent_bride_addr  TEXT DEFAULT 'Phường XYZ, TP. Huế';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_label TEXT DEFAULT 'Lễ Gia Tiên Nhà Trai';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_time  TEXT DEFAULT '07:30 SA';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_date  TEXT DEFAULT '27 . 04 . 2026';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_lunar TEXT DEFAULT '10/03 Âm lịch';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_place TEXT DEFAULT 'Tại tư gia Nhà Trai';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony1_addr  TEXT DEFAULT 'Phường ABC, TP. Huế';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_label TEXT DEFAULT 'Lễ Cưới';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_time  TEXT DEFAULT '10:00 SA';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_date  TEXT DEFAULT '26 . 04 . 2026';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_lunar TEXT DEFAULT '09/03 Âm lịch';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_place TEXT DEFAULT 'Tại nhà hàng';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS ceremony2_addr  TEXT DEFAULT 'Phường XYZ, TP. Huế';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS sec_invite_title TEXT DEFAULT 'Thư Mời';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS sec_invite_sub   TEXT DEFAULT 'THAM DỰ LỄ THÀNH HÔN';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS sec_invite_body  TEXT DEFAULT 'Chúng tôi trân trọng kính mời...';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS sec_cal_title    TEXT DEFAULT 'Thư Mời';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS sec_cal_sub      TEXT DEFAULT 'THAM DỰ TIỆC MỪNG';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS mong_text        TEXT DEFAULT 'Rất mong được mọi người chung vui';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS quote1  TEXT DEFAULT 'Anh về hái lấy buồng cau...';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS quote2  TEXT DEFAULT 'Có lẽ thế gian này...';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS quote3  TEXT DEFAULT 'Khoảnh khắc gặp được em...';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS quote4  TEXT DEFAULT 'Hôn nhân là chuyện cả đời...';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS quote5  TEXT DEFAULT 'With love ♥';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_groom_bank TEXT DEFAULT 'Vietcombank';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_groom_num  TEXT DEFAULT '0123 456 789';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_groom_name TEXT DEFAULT 'NGUYEN VIET DINH';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_groom_img  TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_bride_bank TEXT DEFAULT 'Vietcombank';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_bride_num  TEXT DEFAULT '9876 543 210';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_bride_name TEXT DEFAULT 'TRAN BAO NGAN';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS qr_bride_img  TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS hero_img    TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS couple_img  TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_large TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_sm1   TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_sm2   TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_wide1 TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_wide2 TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_pair1 TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_pair2 TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS photo_full  TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS gallery       JSONB DEFAULT '[]';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS music_youtube TEXT DEFAULT '';
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- ── 2. Bảng RSVP ──
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  attending    BOOLEAN NOT NULL DEFAULT true,
  guests_count INT DEFAULT 1,
  message      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. RLS ──
ALTER TABLE wedding_config  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses  ENABLE ROW LEVEL SECURITY;

-- ── 4. Drop old policies & recreate ──
DROP POLICY IF EXISTS "public read config"    ON wedding_config;
DROP POLICY IF EXISTS "public update config"  ON wedding_config;
DROP POLICY IF EXISTS "public insert config"  ON wedding_config;
DROP POLICY IF EXISTS "public delete config"  ON wedding_config;
DROP POLICY IF EXISTS "anon all config"       ON wedding_config;
DROP POLICY IF EXISTS "public insert rsvp"    ON rsvp_responses;
DROP POLICY IF EXISTS "public select rsvp"    ON rsvp_responses;
DROP POLICY IF EXISTS "public delete rsvp"    ON rsvp_responses;
DROP POLICY IF EXISTS "anon all rsvp"         ON rsvp_responses;

CREATE POLICY "anon all config"
  ON wedding_config FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon all rsvp"
  ON rsvp_responses FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── 5. Insert row mặc định ──
INSERT INTO wedding_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

SELECT 'Setup hoàn tất!' AS message;
