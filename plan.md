# Apollo LRV — Lunar Field Simulator

## Phạm vi và hướng triển khai

Xây dựng một trải nghiệm web Three.js toàn màn hình, không backend, mô phỏng Apollo Lunar Roving Vehicle bằng procedural geometry. Toàn bộ chuyển động lấy từ một playhead duy nhất `t` trong khoảng 0–25 giây; trạng thái pose, camera, wheels, suspension, HUD, labels và mission log được suy ra từ `t` để scrub tiến/lùi nhất quán. Giao diện dùng một `index.html` giàu tương tác với CSS và JavaScript ES module, được phục vụ bằng Vite; Three.js 0.170.0 là dependency duy nhất cho đồ họa 3D.

Các assembly được xây dựng như những `THREE.Group` độc lập: chassis, wheels, suspension, seats, control/navigation, antenna, camera, batteries/equipment và harnesses. Mỗi nhóm có điểm neo vật lý, pivot và offset teardown riêng; disassembly dùng translate/rotate/scale theo pha easing, không dùng opacity crossfade. Bánh xe dùng vòng torus/wire grid, hub, axle, tread chevrons và gold fender; vật liệu PBR tạo cảm giác aluminium, bronze, charcoal và multilayer thermal foil bằng roughness/normal-like geometry.

Timeline 25 giây gồm ARRIVAL, STATIONARY, WHEEL INSPECTION, SUSPENSION OPEN, CHASSIS OPEN, SEAT DEPLOYMENT, CONTROL SYSTEM, ANTENNA DEPLOYMENT, FULL TEARDOWN, REASSEMBLY, HERO HOLD và DEPARTURE. Timeline controls gồm play/pause, scrub bar, operation markers và timecode. Các nút assembly nhảy đến mốc inspection; LABELS, EXPLODED, WHEEL SPIN và TURNTABLE là state tương tác giữ nguyên cho tới khi mission section kế tiếp bắt đầu. Orbit drag/zoom dùng camera điều khiển thủ công có damping và giới hạn pitch.

## Design

- **Design Movement:** premium aerospace museum exhibition / technical product showcase, trực tiếp kế thừa reference warm taupe-grey và các panel kiểm định mảnh.
- **Core Principles:** mô hình cơ khí là hero; dữ liệu HUD phải hữu dụng; tương phản ấm–than làm kim loại nổi bật; chuyển động phải phản ánh cấu trúc chứ không chỉ là hiệu ứng.
- **Color Philosophy:** nền taupe-grey làm môi trường studio trung tính; ivory và brushed aluminium cung cấp độ sáng kỹ thuật; thermal gold/bronze gợi vật liệu tàu vũ trụ; coral-orange là tín hiệu thao tác và leader line, dùng tiết chế để giữ vẻ cao cấp.
- **Layout Paradigm:** composition bất đối xứng kiểu mission-control dashboard: canvas ở trung tâm, telemetry cards bám hai mép, header và footer neo theo viewport, timeline tạo trục ngang ở đáy.
- **Signature Elements:** các orbital rings mảnh sau xe; nhãn kỹ thuật có leader line màu coral; power strip 50 ô và micro-bars lặp lại như thiết bị đo.
- **Interaction Philosophy:** mọi điều khiển đều giải thích trực tiếp chuyển động hoặc dữ liệu của assembly; scrub là công cụ kiểm tra cơ khí, assembly buttons là các preset inspection, không có trạng thái ẩn.
- **Animation:** easing cơ khí có overshoot rất nhẹ; bánh, suspension và antenna chuyển động đồng bộ theo pha; teardown tách theo trục lắp ráp và reassembly đảo ngược chính xác; HUD thay đổi nhẹ theo `t` nhưng không gây nhiễu.
- **Typography System:** Inter cho tiêu đề, số lớn và trạng thái; JetBrains Mono cho mã module, measurements, labels và operation log.
- **Brand Essence:** phòng trưng bày kỹ thuật tương tác cho hệ thống di chuyển Mặt Trăng — chính xác, điện ảnh, có thể kiểm tra.
- **Brand Voice:** ngắn, định lượng và mang tính vận hành. Ví dụ: “SUSPENSION RESPONSE / NOMINAL” và “TRACE THE MECHANISM. SCRUB THE MISSION.”
- **Wordmark & Logo:** wordmark APOLLO LRV kèm dấu quỹ đạo hình cung và ô định danh LRV-1; dùng như CSS mark trong header, không phụ thuộc ảnh ngoài.
- **Signature Brand Color:** `#F5793A` coral-orange cho mọi affordance chính.

## Kiến trúc file

- `index.html`: HTML có ý nghĩa cho dashboard, meta tags, inline styles và module bootstrap; là trải nghiệm single-file theo yêu cầu.
- `src/main.js`: scene setup, procedural model factories, materials, deterministic mission state, camera/orbit input, HUD binding và event handlers.
- `public/manus-routes.json`: khai báo route `/` cho WebDev preview/publish.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`: toolchain Vite + Three.js với package manager pin và policy lifecycle rõ ràng.
- `app.config.ts`: logoUrl literal cho metadata project của WebDev.
- `TODO.md`: outcome/acceptance clauses và trạng thái triển khai.

## Build và delivery

Dùng `pnpm install`, `pnpm dev --host 0.0.0.0` cho preview port 3000, `pnpm build` để tạo `dist/`. Trước dev server phải có route manifest. Kiểm tra diagnostics tự động, request HTTP cho manifest và build output; dùng screenshot preview khi cần đánh giá bố cục. Không bật database/server vì simulator là static client-only. Lưu thay đổi bằng commit lên `origin/main` để tạo checkpoint; không publish công khai trong phạm vi hiện tại.
