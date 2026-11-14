# TODO — Apollo LRV Lunar Field Simulator

## 1. Thiết lập static WebDev app và metadata

- [x] Khởi tạo project WebDev static với runtime port 3000 và không bật server/database.
- [x] Có `package.json` pin pnpm, Vite và Three.js 0.170.0; `pnpm install` chạy thành công.
- [x] Có `public/manus-routes.json` khai báo chính xác route `/` với title `Apollo LRV — Lunar Field Simulator`.
- [x] Initial HTML có title `Apollo LRV — Lunar Field Simulator`, meta description `Explore the Apollo Lunar Roving Vehicle through an interactive procedural 3D engineering simulator.`, heading/body content có ý nghĩa và không cần chạy JavaScript mới thấy nội dung chính.

## 2. Dựng procedural Apollo LRV và stage PBR

- [x] Canvas full-viewport chiếm vùng hero; rover là visual dominant trong góc nhìn three-quarter và cả bốn bánh nhìn thấy.
- [x] Mô hình được tạo hoàn toàn bằng Three.js geometry, không dùng external 3D model/image/video.
- [x] Chassis là open rectangular aluminium frame với front/rear structures, floor, cross-members, brackets, bolts, cables và gold thermal insulation.
- [x] Mỗi bánh có metallic wire-mesh construction, aluminium hub, axle, motor housing, chevron-inspired titanium tread, gold fender và hub quay độc lập; bánh trông như Apollo LRV mesh wheel chứ không phải lốp cao su.
- [x] Có bốn suspension assembly độc lập gồm upper/lower arm, struts, pivot joints, shock absorber, axle và fasteners.
- [x] Có hai astronaut seats bằng beige fabric và aluminium tubular frame, backrest, armrest, support, belt; seats có thể chọn/tháo trong teardown.
- [x] Có control console với steering control, navigation/speed/heading display, switches, instrument panels, wiring/connectors.
- [x] Có high-gain parabolic antenna với segmented reflector, radial ribs, feed, articulated bracket, telescopic mast và rotating base; có television camera housing/lens/bracket/cable quay độc lập.
- [x] Stage có background taupe-grey, radial lighting, soft ground shadow, subtle warm reflections và năm orbital rings kỹ thuật sau model.

## 3. Deterministic 25-second mission timeline

- [x] Một playhead duy nhất `t` trong 0–25 giây điều khiển pose, camera mission path, wheels, suspension, HUD và operation log; mọi chuyển động reversible khi scrub hai chiều.
- [x] Mission loop có đúng các section: ARRIVAL 0–2.5, STATIONARY 2.5–4, WHEEL INSPECTION 4–6, SUSPENSION OPEN 6–8, CHASSIS OPEN 8–10, SEAT DEPLOYMENT 10–12, CONTROL SYSTEM 12–14, ANTENNA DEPLOYMENT 14–16, FULL TEARDOWN 16–19, REASSEMBLY 19–21, HERO HOLD 21–23, DEPARTURE 23–25.
- [x] Arrival/departure cho rover entering/exiting frame, wheels rotate và suspension phản ứng; stationary có camera approach; inspection sections expose the named mechanical subsystem.
- [x] Full teardown xoay rover 330 degrees và tách các mechanical assemblies; reassembly đưa component về đúng vị trí ban đầu bằng chuyển động cơ học, không opacity crossfade.
- [x] HUD hiển thị mode, operation description, runtime/timecode và trạng thái động đồng bộ với `t`.

## 4. Dashboard và responsive visual system

- [x] Header có orange technical block, Apollo LRV insignia, `LRV-1`, `APOLLO LUNAR EXPLORATION PROGRAM`, `Lunar Roving Vehicle`, subtitle `ELECTRIC MOBILITY PLATFORM / LUNAR SURFACE OPERATIONS`.
- [x] Top-center có 50-cell indicator cho POWER LOAD, DRIVE, STEERING, SUSPENSION; top-right có VEHICLE ID, MISSION, RUNTIME, STATUS và LOCATION.
- [x] Left cards có MOBILITY 01, POWER SYSTEM 02, SUSPENSION 03 với speed, wheel rotation, distance, motor, traction graph, battery capacity/energy/consumption/temperature, four batteries và individual suspension travel/status.
- [x] Right cards có NAVIGATION 04, ASSEMBLIES 05, DISPLAY 06 và SUBSYSTEMS 07; subsystem rows cập nhật WHEEL ASSEMBLY, SUSPENSION SYSTEM, CHASSIS FRAME, POWER SYSTEM, NAVIGATION UNIT, COMMUNICATION ARRAY.
- [x] Lower center có OPERATING MODE, mode name và mechanical operation description; bottom center có OPERATION LOG 08 với play/pause, 25-second timeline, markers, description, timecode và operator actions; footer có hai dòng Apollo/Lunar Exploration Systems.
- [x] Bố cục responsive: ở viewport hẹp panel co/ẩn hợp lý nhưng canvas, timeline và các điều khiển chính vẫn dùng được; typography Inter + JetBrains Mono và palette theo đặc tả.

## 5. Interaction và inspection controls

- [x] Drag để orbit, scroll để zoom, damping mượt, pitch camera bị giới hạn; TURNTABLE bật model rotation liên tục nhưng vẫn lấy góc từ playhead.
- [x] Assembly buttons HERO, WHEELS, SUSPENSION, CHASSIS, SEATS, CONTROL, ANTENNA, CAMERA nhảy camera và playhead đến inspection section tương ứng.
- [x] Display toggles LABELS, EXPLODED, WHEEL SPIN, TURNTABLE hoạt động và giữ state tới mission section kế tiếp.
- [x] Spacebar pause/resume; play/pause dừng hoặc tiếp tục playback; timeline click/drag scrub chính xác.
- [x] Click assembly gọi cùng inspection flow với preset camera/playhead và hiển thị tối đa bốn technical labels với thin orange leader lines; labels gồm WIRE-MESH WHEEL, INDEPENDENT SUSPENSION, ALUMINIUM CHASSIS, NAVIGATION CONSOLE, HIGH-GAIN ANTENNA, TELEVISION CAMERA, BATTERY ASSEMBLY, ASTRONAUT SEAT.

## 6. Kiểm tra và checkpoint

- [x] Diagnostics được đăng ký cho mã frontend; không còn lỗi actionable được phát hiện trong kiểm tra sau patch.
- [x] `pnpm build` tạo output có `dist/index.html`; dev server nghe trên `0.0.0.0:3000` và `/manus-routes.json` trả JSON 200 đúng schema.
- [x] Preview desktop 1440×900 và mobile 390×844 đã render được hero composition, panel/timeline và responsive layout; preview sau patch xác nhận labels/camera path không phá bố cục.
- [x] Commit intended files lên `origin/main` và xác nhận checkpoint SHA `d090c4cacc0c6aa65794636cf159c976b57b492f`; chưa publish công khai.

## Evidence note

Build hiện có cảnh báo bundle Three.js sau minify khoảng 534 kB, nhưng build vẫn thành công và preview render ổn. Đây là cảnh báo tối ưu tải, không phải lỗi chức năng; chưa thay đổi kiến trúc single-page để tránh làm loãng deliverable procedural simulator.
