-- =============================================================================
-- DANE DEMONSTRACYJNE — Kurs Druku 3D
-- Cel: screenshoty marketingowe
-- Hasło wszystkich kursantów: Kurs3D2025!
-- (hash bcrypt cost 10 — można zresetować przez panel admina)
-- =============================================================================
-- Uruchomienie: psql $DATABASE_URL -f query.sql
-- UWAGA: Skrypt jest idempotentny — używa ON CONFLICT DO NOTHING / DO UPDATE
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. ROZSZERZENIA
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. UŻYTKOWNICY — 2 administratorów + 20 kursantów
-- ---------------------------------------------------------------------------
-- Hasło dla wszystkich: Kurs3D2025!
-- Wygenerowany hash (bcrypt $2b$10$):
-- Jeśli chcesz ustawić własne hasło, uruchom:
--   SELECT crypt('TwojeHaslo', gen_salt('bf', 10));
-- i podmień wartość poniżej.

INSERT INTO "User" (
  id, email, username, "passwordHash", role,
  "avatarUrl", "lastActiveAt", "emailVerified",
  "createdAt", "updatedAt"
) VALUES

-- Administratorzy (instruktorzy)
(
  'adm-001', 'marek.wisniewski@magbase.pl', 'marek_instruktor',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'ADMIN',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=marek&backgroundColor=6d28d9',
  NOW() - INTERVAL '2 minutes', NOW(),
  NOW() - INTERVAL '180 days', NOW()
),
(
  'adm-002', 'anna.kowalczyk@magbase.pl', 'anna_instruktor',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'ADMIN',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=anna&backgroundColor=7c3aed',
  NOW() - INTERVAL '15 minutes', NOW(),
  NOW() - INTERVAL '175 days', NOW()
),

-- Kursanci
(
  'usr-001', 'piotr.nowak@gmail.com', 'piotr_nowak',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=piotr&backgroundColor=1e40af',
  NOW() - INTERVAL '5 minutes', NOW(),
  NOW() - INTERVAL '90 days', NOW()
),
(
  'usr-002', 'katarzyna.wrobel@gmail.com', 'kasia_wrobel',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=katarzyna&backgroundColor=be185d',
  NOW() - INTERVAL '1 hour', NOW(),
  NOW() - INTERVAL '85 days', NOW()
),
(
  'usr-003', 'tomasz.kowalski@wp.pl', 'tomek_kowalski',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=tomasz&backgroundColor=065f46',
  NOW() - INTERVAL '3 hours', NOW(),
  NOW() - INTERVAL '80 days', NOW()
),
(
  'usr-004', 'agnieszka.maj@onet.pl', 'agnieszka_m',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=agnieszka&backgroundColor=92400e',
  NOW() - INTERVAL '30 minutes', NOW(),
  NOW() - INTERVAL '75 days', NOW()
),
(
  'usr-005', 'michal.zielinski@gmail.com', 'michal_3d',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=michal&backgroundColor=1e3a5f',
  NOW() - INTERVAL '45 minutes', NOW(),
  NOW() - INTERVAL '70 days', NOW()
),
(
  'usr-006', 'barbara.lewandowska@gmail.com', 'basia_druk',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=barbara&backgroundColor=831843',
  NOW() - INTERVAL '2 hours', NOW(),
  NOW() - INTERVAL '65 days', NOW()
),
(
  'usr-007', 'rafal.szymanski@wp.pl', 'rafal_s',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=rafal&backgroundColor=14532d',
  NOW() - INTERVAL '6 hours', NOW(),
  NOW() - INTERVAL '60 days', NOW()
),
(
  'usr-008', 'dorota.kaminska@interia.pl', 'dorota_k',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=dorota&backgroundColor=7e22ce',
  NOW() - INTERVAL '20 minutes', NOW(),
  NOW() - INTERVAL '55 days', NOW()
),
(
  'usr-009', 'krzysztof.wojcik@gmail.com', 'krzysiek_w',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=krzysztof&backgroundColor=0f172a',
  NOW() - INTERVAL '4 hours', NOW(),
  NOW() - INTERVAL '50 days', NOW()
),
(
  'usr-010', 'monika.dabrowska@gmail.com', 'monika_3d',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=monika&backgroundColor=4c1d95',
  NOW() - INTERVAL '10 minutes', NOW(),
  NOW() - INTERVAL '45 days', NOW()
),
(
  'usr-011', 'jakub.pawlak@gmail.com', 'kuba_maker',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jakub&backgroundColor=1c1917',
  NOW() - INTERVAL '1 day', NOW(),
  NOW() - INTERVAL '40 days', NOW()
),
(
  'usr-012', 'karolina.witkowska@wp.pl', 'karolina_w',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=karolina&backgroundColor=881337',
  NOW() - INTERVAL '3 days', NOW(),
  NOW() - INTERVAL '35 days', NOW()
),
(
  'usr-013', 'lukasz.kaczmarek@gmail.com', 'lukasz_k',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=lukasz&backgroundColor=166534',
  NOW() - INTERVAL '2 days', NOW(),
  NOW() - INTERVAL '30 days', NOW()
),
(
  'usr-014', 'magdalena.ostrowski@interia.pl', 'magda_druk',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=magdalena&backgroundColor=7c2d12',
  NOW() - INTERVAL '5 hours', NOW(),
  NOW() - INTERVAL '25 days', NOW()
),
(
  'usr-015', 'pawel.grabowski@gmail.com', 'pawel_g',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=pawel&backgroundColor=0c4a6e',
  NOW() - INTERVAL '7 hours', NOW(),
  NOW() - INTERVAL '20 days', NOW()
),
(
  'usr-016', 'sylwia.michalak@gmail.com', 'sylwia_m',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sylwia&backgroundColor=500724',
  NOW() - INTERVAL '12 hours', NOW(),
  NOW() - INTERVAL '18 days', NOW()
),
(
  'usr-017', 'adam.wisniewicz@wp.pl', 'adam_w',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=adam&backgroundColor=172554',
  NOW() - INTERVAL '1 hour', NOW(),
  NOW() - INTERVAL '14 days', NOW()
),
(
  'usr-018', 'natalia.czerwinska@gmail.com', 'natalia_c',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=natalia&backgroundColor=3f0764',
  NOW() - INTERVAL '2 hours', NOW(),
  NOW() - INTERVAL '10 days', NOW()
),
(
  'usr-019', 'robert.jankowski@onet.pl', 'robert_j',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=robert&backgroundColor=052e16',
  NOW() - INTERVAL '3 hours', NOW(),
  NOW() - INTERVAL '7 days', NOW()
),
(
  'usr-020', 'aleksandra.piotrowska@gmail.com', 'ola_3d',
  crypt('Kurs3D2025!', gen_salt('bf', 10)),
  'STUDENT',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=aleksandra&backgroundColor=6b21a8',
  NOW() - INTERVAL '15 minutes', NOW(),
  NOW() - INTERVAL '3 days', NOW()
)

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. ROZDZIAŁY I LEKCJE
-- ---------------------------------------------------------------------------

INSERT INTO "Chapter" (id, title, description, "order", "createdAt", "updatedAt") VALUES
('ch-01', 'Wprowadzenie do druku 3D',      'Pierwsze kroki z technologią FDM i drukarką Bambu Lab A1 Mini.',         1, NOW() - INTERVAL '170 days', NOW()),
('ch-02', 'Filamenty — materiały do druku', 'Poznaj różnicę między PLA, PETG i innymi popularnymi filamentami.',       2, NOW() - INTERVAL '168 days', NOW()),
('ch-03', 'Slicowanie w Bambu Studio',      'Naucz się przygotowywać modele do druku w oprogramowaniu producenta.',   3, NOW() - INTERVAL '165 days', NOW()),
('ch-04', 'Modelowanie 3D od podstaw',      'Pierwsze kroki w projektowaniu własnych modeli od zera.',                4, NOW() - INTERVAL '162 days', NOW()),
('ch-05', 'Zaawansowane techniki',          'Druk wielokolorowy, optymalizacja wytrzymałości i post-processing.',     5, NOW() - INTERVAL '160 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Lesson" (id, title, description, "order", "chapterId", "createdAt", "updatedAt") VALUES
-- Rozdział 1
('les-01', 'Czym jest druk 3D FDM?',
  'Zasada działania technologii FDM — od modelu cyfrowego do fizycznego wydruku.',
  1, 'ch-01', NOW() - INTERVAL '170 days', NOW()),
('les-02', 'Unboxing i setup Bambu Lab A1 Mini',
  'Krok po kroku rozpakowujemy drukarkę i przygotowujemy do pierwszego wydruku.',
  2, 'ch-01', NOW() - INTERVAL '169 days', NOW()),
('les-03', 'Pierwsze uruchomienie i kalibracja',
  'Automatyczna kalibracja stołu, flow calibration i pierwsza linia testowa.',
  3, 'ch-01', NOW() - INTERVAL '168 days', NOW()),
('les-04', 'Bezpieczeństwo podczas druku',
  'Wentylacja, temperatury i co zrobić gdy coś idzie nie tak.',
  4, 'ch-01', NOW() - INTERVAL '167 days', NOW()),

-- Rozdział 2
('les-05', 'PLA — wszystko co musisz wiedzieć',
  'Temperatura, prędkość, chłodzenie. PLA krok po kroku.',
  1, 'ch-02', NOW() - INTERVAL '165 days', NOW()),
('les-06', 'PETG — wytrzymałość i ciepłoodporność',
  'Kiedy PLA nie wystarczy — zalety PETG i pułapki przy druku.',
  2, 'ch-02', NOW() - INTERVAL '164 days', NOW()),
('les-07', 'Przechowywanie i suszenie filamentów',
  'Wilgotność, suszarki i jak przedłużyć życie filamentu.',
  3, 'ch-02', NOW() - INTERVAL '163 days', NOW()),

-- Rozdział 3
('les-08', 'Interfejs Bambu Studio — pierwsze spojrzenie',
  'Omówienie głównych paneli, import STL i podstawowa orientacja.',
  1, 'ch-03', NOW() - INTERVAL '162 days', NOW()),
('les-09', 'Podstawowe parametry — layer height, infill, prędkość',
  'Co każdy parametr oznacza i jak wpływa na wydruk.',
  2, 'ch-03', NOW() - INTERVAL '161 days', NOW()),
('les-10', 'Podpory — kiedy i jak ich używać',
  'Automatyczne i manualne podpory, jak minimalizować ich użycie.',
  3, 'ch-03', NOW() - INTERVAL '160 days', NOW()),
('les-11', 'Wzory wypełnienia i gęstość',
  'Gyroid, lightning, grid — który wybrać i dlaczego.',
  4, 'ch-03', NOW() - INTERVAL '159 days', NOW()),
('les-12', 'Eksport G-code i druk przez WiFi',
  'Przesyłanie wydruków bezprzewodowo bezpośrednio na drukarkę.',
  5, 'ch-03', NOW() - INTERVAL '158 days', NOW()),

-- Rozdział 4
('les-13', 'Przegląd programów do modelowania',
  'TinkerCAD, Fusion 360, Blender — który wybrać na start.',
  1, 'ch-04', NOW() - INTERVAL '156 days', NOW()),
('les-14', 'Pierwsze kroki w TinkerCAD',
  'Rejestracja, nawigacja i pierwsze bryły w przeglądarce.',
  2, 'ch-04', NOW() - INTERVAL '155 days', NOW()),
('les-15', 'Operacje boolowskie — łączenie i odejmowanie brył',
  'Jak tworzyć skomplikowane kształty z prostych figur.',
  3, 'ch-04', NOW() - INTERVAL '154 days', NOW()),
('les-16', 'Eksport do STL i import do slicera',
  'Jak poprawnie wyeksportować model i sprawdzić czy jest "watertight".',
  4, 'ch-04', NOW() - INTERVAL '153 days', NOW()),

-- Rozdział 5
('les-17', 'Druk wielokolorowy z AMS Lite',
  'Ustawienia wielokolorowe, purgowanie i jak zaplanować kolory w modelu.',
  1, 'ch-05', NOW() - INTERVAL '150 days', NOW()),
('les-18', 'Optymalizacja wytrzymałości wydruków',
  'Orientacja wydruku, liczba perimetrów, infill dla maksymalnej siły.',
  2, 'ch-05', NOW() - INTERVAL '149 days', NOW()),
('les-19', 'Post-processing — szlifowanie, malowanie, klejenie',
  'Obróbka mechaniczna i chemiczna gotowych wydruków.',
  3, 'ch-05', NOW() - INTERVAL '148 days', NOW()),
('les-20', 'Projekt końcowy — od pomysłu do wydruku',
  'Kompleksowe ćwiczenie: zaprojektuj, przetnij i wydrukuj własny obiekt.',
  4, 'ch-05', NOW() - INTERVAL '147 days', NOW())

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. KATEGORIE POSTÓW I OGŁOSZEŃ
-- ---------------------------------------------------------------------------

INSERT INTO "Category" (id, name, color, type, "createdAt") VALUES
('cat-p1', 'Pytania techniczne',  '#6d28d9', 'POST'::"CategoryType",         NOW() - INTERVAL '169 days'),
('cat-p2', 'Pokaż swój wydruk',   '#0891b2', 'POST'::"CategoryType",         NOW() - INTERVAL '169 days'),
('cat-p3', 'Porady i triki',      '#059669', 'POST'::"CategoryType",         NOW() - INTERVAL '169 days'),
('cat-p4', 'Problemy z drukiem',  '#dc2626', 'POST'::"CategoryType",         NOW() - INTERVAL '169 days'),
('cat-p5', 'Modelowanie 3D',      '#d97706', 'POST'::"CategoryType",         NOW() - INTERVAL '169 days'),
('cat-a1', 'Nowe materiały',      '#7c3aed', 'ANNOUNCEMENT'::"CategoryType", NOW() - INTERVAL '169 days'),
('cat-a2', 'Aktualizacje kursu',  '#0369a1', 'ANNOUNCEMENT'::"CategoryType", NOW() - INTERVAL '169 days'),
('cat-a3', 'Live session',        '#065f46', 'ANNOUNCEMENT'::"CategoryType", NOW() - INTERVAL '169 days'),
('cat-a4', 'Ważne informacje',    '#9f1239', 'ANNOUNCEMENT'::"CategoryType", NOW() - INTERVAL '169 days')
ON CONFLICT (type, name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. OGŁOSZENIA (od administratorów)
-- ---------------------------------------------------------------------------

INSERT INTO "Announcement" (id, title, content, "authorId", "categoryId", pinned, "createdAt", "updatedAt") VALUES

('ann-01',
 '🎉 Witamy na platformie kursu druku 3D!',
 '<p>Cześć! Cieszę się, że tu jesteś. Zaczynamy przygodę z drukiem 3D — od dzisiaj masz dostęp do wszystkich lekcji i społeczności kursantów.</p><p><strong>Co znajdziesz na platformie:</strong></p><ul><li>20 lekcji wideo w rozdziale 1–5</li><li>Interaktywne quizy po każdej sekcji</li><li>Forum społecznościowe — pytaj, dziel się, rozmawiaj</li><li>Bezpośredni kontakt z instruktorem przez wiadomości</li></ul><p>Jeśli masz pytania techniczne dotyczące platformy, skorzystaj z przycisku pomocy w prawym dolnym rogu. Życzę owocnej nauki! 🖨️</p>',
 'adm-001', 'cat-a1', TRUE,
 NOW() - INTERVAL '85 days', NOW()),

('ann-02',
 '📦 Drukarki zostały wysłane — sprawdź status dostawy',
 '<p>Drukarki Bambu Lab A1 Mini zostały nadane dzisiaj rano. Numery śledzenia przesyłki zostały wysłane na adres e-mail podany przy rejestracji.</p><p>Czas dostawy: <strong>2–4 dni robocze</strong>. Firma kurierska: InPost.</p><p>Zanim drukarka dotrze, polecam zacząć od lekcji 1 i 2 — po obejrzeniu będziesz gotowy na unboxing i setup od razu!</p>',
 'adm-001', 'cat-a4', FALSE,
 NOW() - INTERVAL '80 days', NOW()),

('ann-03',
 '🔴 Live Q&A — środa 18:00 — zadaj pytanie instruktorowi',
 '<p>W najbliższą środę o godzinie <strong>18:00</strong> organizuję live session na platformie. Możesz zadać dowolne pytanie dotyczące kursu, druku 3D lub modelowania.</p><p>Link do live pojawi się tutaj 15 minut przed startem. Sesja potrwa ok. 60 minut.</p><p>Pytania możesz też wysyłać z wyprzedzeniem — napisz do mnie wiadomość prywatną lub zamieść post w społeczności z tagiem <strong>#live-pytanie</strong>.</p>',
 'adm-001', 'cat-a3', FALSE,
 NOW() - INTERVAL '60 days', NOW()),

('ann-04',
 '✨ Nowe lekcje: Rozdział 5 — Zaawansowane techniki',
 '<p>Właśnie opublikowałam cztery nowe lekcje w rozdziale piątym! To najtrudniejszy, ale też najciekawszy moduł kursu.</p><ul><li><strong>Druk wielokolorowy z AMS Lite</strong> — jak konfigurować wiele kolorów i zarządzać purgowaniem</li><li><strong>Optymalizacja wytrzymałości</strong> — orientacja, perimetry, infill dla mechanicznych części</li><li><strong>Post-processing</strong> — szlifowanie, gruntowanie, malowanie i klejenie</li><li><strong>Projekt końcowy</strong> — kompleksowe ćwiczenie od modelu do wydruku</li></ul><p>Miłego drukowania! 🎨</p>',
 'adm-002', 'cat-a1', FALSE,
 NOW() - INTERVAL '40 days', NOW()),

('ann-05',
 '📝 Aktualizacja lekcji 9 — nowe parametry Bambu Studio 1.9',
 '<p>Lekcja 9 "Podstawowe parametry" została zaktualizowana pod najnowszą wersję Bambu Studio 1.9. Zmieniły się m.in. opcje zarządzania prędkością i nowe presety dla A1 Mini.</p><p>Jeśli uczyłeś się na starszej wersji — wróć do lekcji i sprawdź nowy materiał. Są tam też dwa bonusowe przykłady ustawień.</p>',
 'adm-002', 'cat-a2', FALSE,
 NOW() - INTERVAL '25 days', NOW()),

('ann-06',
 '🏆 Konkurs — wyślij swój najlepszy wydruk z kursu!',
 '<p>Startujemy z pierwszym konkursem dla kursantów! <strong>Zasady:</strong></p><ol><li>Wydrukuj dowolny model, który zaprojektowałeś lub znalazłeś podczas kursu</li><li>Zrób zdjęcie i opublikuj post w kategorii "Pokaż swój wydruk"</li><li>Opisz co drukowałeś, jakie parametry użyłeś i jakie problemy rozwiązałeś</li></ol><p><strong>Nagroda:</strong> zestaw próbek filamentów (PLA, PETG, TPU) od naszego partnera.<br><strong>Termin:</strong> 2 tygodnie od daty tego ogłoszenia.</p><p>Powodzenia! 🖨️</p>',
 'adm-001', 'cat-a4', FALSE,
 NOW() - INTERVAL '10 days', NOW())

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. POSTY SPOŁECZNOŚCIOWE
-- ---------------------------------------------------------------------------

INSERT INTO "Post" (id, "authorId", "categoryId", title, content, "createdAt", "updatedAt") VALUES

('pst-01', 'usr-001', 'cat-p2',
 'Mój pierwszy wydruk — uchwyt na kabel',
 'Właśnie skończyłem drukować swój pierwszy projekt w TinkerCAD — prosty uchwyt na kabel USB od monitora. Druk trwał 47 minut, PLA białe, layer height 0.2mm. Jestem z siebie dumny! 😄 Czy ktoś ma pomysł co wydrukować jako drugi projekt?',
 NOW() - INTERVAL '78 days', NOW()),

('pst-02', 'usr-003', 'cat-p1',
 'Problem z adhezją — filament nie przykleja się do stołu',
 'Mam problem z pierwszą warstwą — filament nie chce się przykleić do stołu. Kalibracja zrobiona, temperatura 60°C na stole, 215°C na dyszy. PLA czarne. Co może być przyczyną? Próbowałem też kleju do papieru ale bez efektu.',
 NOW() - INTERVAL '75 days', NOW()),

('pst-03', 'usr-005', 'cat-p3',
 'Tip: jak przyspieszyć pierwsze wydruki — preset Speed',
 'Odkryłem że w Bambu Studio jest preset "Speed" który automatycznie ustawia większą prędkość dla wypełnienia (300mm/s) i zostawia normalną dla ścian zewnętrznych. Wydruki wychodzą tak samo ładne, a czas druku skraca się o ok. 20–30%. Polecam!',
 NOW() - INTERVAL '70 days', NOW()),

('pst-04', 'usr-002', 'cat-p2',
 'Wydruk wazonu — moja pierwsza dekoracja',
 'Znalazłam na Printables.com piękny wazon generatywny i go wydrukowałam w trybie "vase mode" (spirala). Druk trwał 3,5h, PETG przezroczyste. Efekt jest niesamowity — polecam tryb wazonu dla dekoracji, brak wypełnienia i supportów!',
 NOW() - INTERVAL '65 days', NOW()),

('pst-05', 'usr-007', 'cat-p4',
 'Stringing przy PETG — jak to naprawić?',
 'Mam poważny problem ze "stringing" przy druku PETG — między częściami wydruku tworzą się cienkie nici filamentu. Temperatura 240°C. Próbowałem zwiększyć retraction do 1mm ale bez większego efektu. Ktoś wie jak to ogarnąć?',
 NOW() - INTERVAL '60 days', NOW()),

('pst-06', 'usr-010', 'cat-p5',
 'Zaczęłam kurs Fusion 360 — jest trudniejszy niż myślałam',
 'Skończyłam TinkerCAD (super na start!) i przeszłam do Fusion 360 jak polecał Marek w lekcji 13. Wow, różnica jest ogromna. Czy ktoś może polecić dobre tutoriale YouTube do Fusiona po polsku? Oficjalny kurs Autodeska jest po angielsku i trochę mi to utrudnia.',
 NOW() - INTERVAL '55 days', NOW()),

('pst-07', 'usr-004', 'cat-p2',
 'Wieszak na słuchawki — projekt i wydruk',
 'Mój najnowszy projekt — wieszak na słuchawki do powieszenia na blacie biurka. Zaprojektowałam sama w TinkerCAD, dwa kolory (czarny + biały) drukowane z AMS Lite. Całość składa się z 3 części skręcanych śrubkami M3. Czas druku: 2h 15min.',
 NOW() - INTERVAL '50 days', NOW()),

('pst-08', 'usr-009', 'cat-p1',
 'Pytanie o AMS Lite — ile kolorów jednocześnie?',
 'W lekcji 17 mówiliście o druku wielokolorowym z AMS Lite. Czy mogę załadować 4 kolory jednocześnie i wszystkie użyć w jednym wydruku? I jak to wpływa na czas — słyszałem że purgowanie zajmuje dużo czasu.',
 NOW() - INTERVAL '45 days', NOW()),

('pst-09', 'usr-006', 'cat-p3',
 'Jak obsługuję filament po otwarciu szpuli — moje porady',
 'Przez pierwsze tygodnie nie wiedziałam jak przechowywać filament po otwarciu i miałam problemy z pękaniem. Teraz używam pojemnika próżniowego z siliką żelową. Kilka porad: 1) zawsze zamknij szpulę po druku, 2) kup higrometr do pudełka, 3) nie trzymaj w pobliżu okna. Macie inne patenty?',
 NOW() - INTERVAL '40 days', NOW()),

('pst-10', 'usr-011', 'cat-p2',
 'Druk części do roweru — bracket pod bidon',
 'Wyzwanie: zaprojektować i wydrukować bracket pod bidon rowerowy kompatybilny z moją ramą. Tydzień projektu w Fusion 360, 3 iteracje druku, w końcu siedzi idealnie. PETG czarne, 4 perimetry, 40% gyroid infill. Wytrzymałość testowana — trzyma nawet na szutrze!',
 NOW() - INTERVAL '35 days', NOW()),

('pst-11', 'usr-013', 'cat-p4',
 'Warping przy dużych wydrukach — co robić?',
 'Drukuję dużą część (170x160mm) z PLA i brzegi odchodzą mi od stołu w trakcie druku. Używam kleju, stół 65°C. Część kanciastych rogów to najgorszy problem. Słyszałem o brim i raft — która opcja jest lepsza?',
 NOW() - INTERVAL '30 days', NOW()),

('pst-12', 'usr-015', 'cat-p5',
 'Projekt organizera do warsztatu — szuflady z etykietami',
 'Po ukończeniu rozdziału 4 zrobiłem swój największy projekt — modularny organizer do szuflad warsztatowych. Każdy pojemnik parametryczny, można zmienić wymiary w TinkerCAD. Jutro wrzucę pliki STL na Printables jeśli ktoś chce. Drukuję już 8. pojemnik z 24 planowanych 😅',
 NOW() - INTERVAL '25 days', NOW()),

('pst-13', 'usr-017', 'cat-p1',
 'Jak czyścić dyszę po zmianie koloru filamentu?',
 'Zmieniłem kolor z czarnego na biały PLA i pierwsze wydruki są szare — poprzedni kolor zostaje w dyszy. Jak to poprawnie oczyścić? Czy wystarczy purge na początku druku czy trzeba coś więcej?',
 NOW() - INTERVAL '20 days', NOW()),

('pst-14', 'usr-019', 'cat-p2',
 'Figurka smoka — 14h druku, efekt WOW',
 'Podjąłem się wydruku popularnego smoka z ruchomymi stawami (drukowanego na raz, bez klejenia). Bambu Lab A1 Mini dała radę — 14 godzin i 23 minuty, PLA złote metaliczne. Stawki działają od razu po wyjęciu ze stołu. To jest magia druku 3D 🐉',
 NOW() - INTERVAL '15 days', NOW()),

('pst-15', 'usr-020', 'cat-p3',
 'Jak znaleźć dobre modele do druku — moje ulubione źródła',
 'Pytałam kilka osób skąd bierze modele i każdy mówił co innego, więc robię zestawienie: 1) Printables.com (najlepsza baza, za darmo), 2) Thingiverse (starsza ale ogromna), 3) Thangs.com (dobra wyszukiwarka), 4) Cults3D (część płatna ale wysokiej jakości). Macie inne polecane źródła?',
 NOW() - INTERVAL '10 days', NOW()),

('pst-16', 'usr-008', 'cat-p4',
 'Wydruk przestał się przywierać w połowie — ghosting?',
 'Coś dziwnego mi się przydarzyło — wydruk zaczął normalnie, a w połowie wysokości zaczął się "przesuwać" — jakby warstwy były przesunięte o kilka milimetrów w bok. To chyba Layer Shift? Mam go zgłosić jako błąd drukarki czy to moja wina przy ustawieniach?',
 NOW() - INTERVAL '5 days', NOW()),

('pst-17', 'usr-014', 'cat-p2',
 'Pudełko z zawiasami drukowane w jednym kawałku',
 'Znalazłam model pudełka z integrowanym zawiasem drukowanym bez żadnych dodatkowych części. PLA, 0.15mm layer height, trochę supportów pod wieczko. Zawias działa od razu — tylko kilka ruchów żeby się "wytarł". Świetny projekt na prezent!',
 NOW() - INTERVAL '2 days', NOW()),

('pst-18', 'usr-012', 'cat-p5',
 'Nauka Blendera do organicznych kształtów',
 'Zaczęłam naukę Blendera bo chcę drukować bardziej organiczne kształty których nie da się zrobić w TinkerCAD. Dużo trudniejszy program ale po tygodniu już rozumiem sculpting. Ktoś tu używa Blendera do modeli pod druk 3D? Mam dużo pytań o przygotowanie siatki do druku.',
 NOW() - INTERVAL '1 day', NOW())

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. KOMENTARZE DO POSTÓW
-- ---------------------------------------------------------------------------

INSERT INTO "Comment" (id, "authorId", "postId", "parentId", content, "createdAt", "updatedAt") VALUES

-- Post 02: Problem z adhezją
('cmt-01', 'adm-001', 'pst-02', NULL,
 'Sprawdź kilka rzeczy: 1) Czy przed drukiem wyczyściłeś stół izopropanolem 99%? Odtłuszczenie jest kluczowe. 2) Czy kalibracja Live Adjust Z jest ustawiona prawidłowo? Filament musi być lekko "wciśnięty" w stół. 3) Temperatura stołu 60°C dla PLA jest w porządku, ale spróbuj 65°C dla pierwszej warstwy.',
 NOW() - INTERVAL '74 days', NOW()),
('cmt-02', 'usr-005', 'pst-02', NULL,
 'Miałem ten sam problem przez pierwsze dwa tygodnie. U mnie pomogło użycie lakieru do włosów (Aqua Net lub podobny) na stół. Może nie jest eleganckim rozwiązaniem ale działa perfekcyjnie na PLA.',
 NOW() - INTERVAL '74 days', NOW()),
('cmt-03', 'usr-003', 'pst-02', 'cmt-01',
 'Dziękuję! Odtłuściłem izopropanolem i poprawiłem Live Z do -0.08mm. Teraz przywiera jak przyklejone. Nie wiedziałem że odtłuszczanie aż tak dużo robi.',
 NOW() - INTERVAL '73 days', NOW()),

-- Post 05: Stringing PETG
('cmt-04', 'adm-002', 'pst-05', NULL,
 'Stringing przy PETG jest klasycznym problemem. Najważniejsze ustawienia do korekty: 1) Retraction speed — spróbuj 40–45mm/s, 2) Temperatura — 240°C jest trochę za wysoka, zacznij od 230–235°C, 3) Włącz "Wipe on layer change". Kombinacja tych trzech powinna mocno zmniejszyć problem.',
 NOW() - INTERVAL '59 days', NOW()),
('cmt-05', 'usr-001', 'pst-05', NULL,
 'Ja walczyłem z tym problem przez tydzień. Ostatecznie pomogło mi wysuszenie filamentu — PETG jest bardzo higroskopijny i z wilgotnego filamentu stringing jest o wiele gorszy. Spróbuj suszyć w piekarniku 65°C przez 4–6 godzin.',
 NOW() - INTERVAL '58 days', NOW()),
('cmt-06', 'usr-007', 'pst-05', 'cmt-04',
 'Obniżyłem temperaturę do 232°C i dodałem wipe on layer change — stringing prawie całkowicie zniknął. Dziękuję! Suszyć filament jeszcze nie próbowałem ale biorę pod uwagę.',
 NOW() - INTERVAL '57 days', NOW()),

-- Post 08: AMS Lite pytanie
('cmt-07', 'adm-001', 'pst-08', NULL,
 'Tak, AMS Lite obsługuje 4 szpule naraz i możesz użyć wszystkich 4 kolorów w jednym wydruku. Purgowanie trwa ok. 2–3 minuty przy każdej zmianie koloru, więc model z wieloma zmianami może mieć dość długi czas druku. Bambu Studio pokazuje szacowany czas z uwzględnieniem purgowania — warto sprawdzić przed startem.',
 NOW() - INTERVAL '44 days', NOW()),
('cmt-08', 'usr-004', 'pst-08', NULL,
 'Drukowałam z 3 kolorami i czas wydłużył się o ok. 40% przez purgowanie. Przy prostych modelach z kilkoma zmianami kolorów na wysokość jest ok, ale dla modeli z wieloma kolorami na jednej warstwie robi się długo.',
 NOW() - INTERVAL '44 days', NOW()),

-- Post 11: Warping
('cmt-09', 'adm-001', 'pst-11', NULL,
 'Dla dużych wydruków polecam Brim (obramowanie) zamiast Raft. Brim dodaje kilka linii dookoła modelu które pomagają z adhezją bez aż takiego marnowania filamentu co Raft. Przy naprawdę dużych kanciastych modelach sprawdza się też obniżenie prędkości wychładzania wentylatorem dla pierwszych 5 warstw.',
 NOW() - INTERVAL '29 days', NOW()),
('cmt-10', 'usr-010', 'pst-11', NULL,
 'Miałam podobny problem. Oprócz brima pomógł mi też draft shield (osłona przed przeciągami) — szczególnie jeśli drukujesz blisko okna lub drzwi.',
 NOW() - INTERVAL '28 days', NOW()),
('cmt-11', 'usr-013', 'pst-11', 'cmt-09',
 'Dodałem Brim 8mm i temperatura stołu 70°C i warping się skończył. Dziękuję za pomoc!',
 NOW() - INTERVAL '27 days', NOW()),

-- Post 13: Czyszczenie dyszy
('cmt-12', 'adm-002', 'pst-13', NULL,
 'W Bambu Studio podczas zmiany filamentu możesz ustawić ilość "purge" (wyczyszczenia). Dla zmiany z ciemnego na jasny kolor ustaw minimum 150mm³ purgowania. W samym AMS Lite możesz też uruchomić Cold Pull — to najlepsza metoda na głębokie czyszczenie dyszy. Opisałam to szczegółowo w wiki.',
 NOW() - INTERVAL '19 days', NOW()),
('cmt-13', 'usr-011', 'pst-13', NULL,
 'Cold Pull robi cuda. Używam PETG do cold pull bo trochę lepiej "wyciąga" resztki. Nagrzej dyszę do 200°C, wciśnij filament, ostudź do 90°C i powoli wyciągnij — zobaczysz co z dyszy wyjdzie.',
 NOW() - INTERVAL '19 days', NOW()),

-- Post 15: Źródła modeli
('cmt-14', 'usr-001', 'pst-15', NULL,
 'Polecam też MakerWorld — to platforma zintegrowana bezpośrednio z Bambu Studio. Możesz jednym kliknięciem wysłać model wprost do slicera z gotowymi presetami. Dużo modeli jest też optymalizowanych specjalnie pod A1 Mini.',
 NOW() - INTERVAL '9 days', NOW()),
('cmt-15', 'usr-006', 'pst-15', NULL,
 'Nie zapomnij o Grabcad — tam jest dużo modeli technicznych i przemysłowych, często z plikami STEP do edycji. Dla hobbystów Printables jest zdecydowanie najlepsza.',
 NOW() - INTERVAL '9 days', NOW()),
('cmt-16', 'adm-001', 'pst-15', NULL,
 'Świetne zestawienie! Dodam jeszcze Bambu MakerWorld który wspomniał Piotr, i polecam sprawdzić lokalne społeczności — jest kilka polskich grup na Facebooku gdzie ludzie dzielą się własnymi projektami.',
 NOW() - INTERVAL '8 days', NOW()),

-- Post 16: Layer shift
('cmt-17', 'adm-002', 'pst-16', NULL,
 'Layer shift zwykle wynika z jednej z tych przyczyn: 1) Za wysoka prędkość — przy skomplikowanych modelach spróbuj zmniejszyć do 80%, 2) Zbyt luźny pasek napędowy — sprawdź czy paski X/Y są odpowiednio napięte, 3) Kolizja głowicy z modelem — może filament "zerwał się" i przykleił do głowicy. Czy widziałeś komunikat błędu na ekranie?',
 NOW() - INTERVAL '4 days', NOW()),
('cmt-18', 'usr-009', 'pst-16', NULL,
 'Miałem layer shift gdy drukarka stała na wibrującym stole (blisko pralki). Przeniesienie na inne miejsce rozwiązało problem. Wibracje zewnętrzne mogą powodować pomijanie kroków przez stepper.',
 NOW() - INTERVAL '3 days', NOW()),

-- Post 17: Pudełko z zawiasami
('cmt-19', 'usr-020', 'pst-17', NULL,
 'Masz link do modelu? To wygląda idealnie na prezent! Widziałam podobne na Printables ale nie wiedziałam że zawias działa bez montażu.',
 NOW() - INTERVAL '1 day', NOW()),
('cmt-20', 'usr-014', 'pst-17', 'cmt-19',
 'Tak, zaraz wrzucę link! Model to "Hinged Box v3" na Printables, autor: designbyGary. Szukaj po tej nazwie, jest parę wersji różnych rozmiarów.',
 NOW() - INTERVAL '1 day', NOW()),

-- Post 18: Blender
('cmt-21', 'adm-001', 'pst-18', NULL,
 'Blender jest świetnym wyborem do organicznych form! Jeśli chodzi o przygotowanie do druku: po sculptingu zawsze zrób Remesh (tryb Voxel, resolution ok. 0.5mm) i sprawdź siatkę w 3D Print Toolbox (Analyze → Find All Issues). Najczęstszy problem to non-manifold edges — musisz je naprawić zanim wyeksportujesz STL.',
 NOW() - INTERVAL '20 hours', NOW())

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. GŁOSOWANIA NA POSTY (PostVote)
-- ---------------------------------------------------------------------------

INSERT INTO "PostVote" (id, "userId", "postId", value, "createdAt") VALUES
('pvt-001', 'usr-002', 'pst-01', 'UP', NOW() - INTERVAL '77 days'),
('pvt-002', 'usr-003', 'pst-01', 'UP', NOW() - INTERVAL '77 days'),
('pvt-003', 'usr-005', 'pst-01', 'UP', NOW() - INTERVAL '76 days'),
('pvt-004', 'usr-007', 'pst-01', 'UP', NOW() - INTERVAL '76 days'),
('pvt-005', 'adm-001', 'pst-01', 'UP', NOW() - INTERVAL '75 days'),
('pvt-006', 'usr-001', 'pst-03', 'UP', NOW() - INTERVAL '69 days'),
('pvt-007', 'usr-004', 'pst-03', 'UP', NOW() - INTERVAL '69 days'),
('pvt-008', 'usr-006', 'pst-03', 'UP', NOW() - INTERVAL '68 days'),
('pvt-009', 'usr-008', 'pst-03', 'UP', NOW() - INTERVAL '68 days'),
('pvt-010', 'usr-010', 'pst-03', 'UP', NOW() - INTERVAL '67 days'),
('pvt-011', 'usr-011', 'pst-03', 'UP', NOW() - INTERVAL '67 days'),
('pvt-012', 'usr-001', 'pst-04', 'UP', NOW() - INTERVAL '64 days'),
('pvt-013', 'usr-003', 'pst-04', 'UP', NOW() - INTERVAL '64 days'),
('pvt-014', 'usr-009', 'pst-04', 'UP', NOW() - INTERVAL '63 days'),
('pvt-015', 'adm-002', 'pst-04', 'UP', NOW() - INTERVAL '63 days'),
('pvt-016', 'usr-002', 'pst-07', 'UP', NOW() - INTERVAL '49 days'),
('pvt-017', 'usr-010', 'pst-07', 'UP', NOW() - INTERVAL '49 days'),
('pvt-018', 'usr-012', 'pst-07', 'UP', NOW() - INTERVAL '48 days'),
('pvt-019', 'adm-001', 'pst-07', 'UP', NOW() - INTERVAL '48 days'),
('pvt-020', 'usr-004', 'pst-09', 'UP', NOW() - INTERVAL '39 days'),
('pvt-021', 'usr-007', 'pst-09', 'UP', NOW() - INTERVAL '38 days'),
('pvt-022', 'usr-013', 'pst-09', 'UP', NOW() - INTERVAL '38 days'),
('pvt-023', 'usr-015', 'pst-10', 'UP', NOW() - INTERVAL '34 days'),
('pvt-024', 'usr-017', 'pst-10', 'UP', NOW() - INTERVAL '34 days'),
('pvt-025', 'usr-019', 'pst-10', 'UP', NOW() - INTERVAL '33 days'),
('pvt-026', 'adm-001', 'pst-10', 'UP', NOW() - INTERVAL '33 days'),
('pvt-027', 'usr-001', 'pst-12', 'UP', NOW() - INTERVAL '24 days'),
('pvt-028', 'usr-005', 'pst-12', 'UP', NOW() - INTERVAL '23 days'),
('pvt-029', 'usr-008', 'pst-14', 'UP', NOW() - INTERVAL '14 days'),
('pvt-030', 'usr-012', 'pst-14', 'UP', NOW() - INTERVAL '14 days'),
('pvt-031', 'usr-016', 'pst-14', 'UP', NOW() - INTERVAL '13 days'),
('pvt-032', 'usr-018', 'pst-14', 'UP', NOW() - INTERVAL '13 days'),
('pvt-033', 'adm-002', 'pst-14', 'UP', NOW() - INTERVAL '12 days'),
('pvt-034', 'usr-003', 'pst-15', 'UP', NOW() - INTERVAL '9 days'),
('pvt-035', 'usr-007', 'pst-15', 'UP', NOW() - INTERVAL '8 days'),
('pvt-036', 'usr-011', 'pst-15', 'UP', NOW() - INTERVAL '8 days'),
('pvt-037', 'usr-013', 'pst-15', 'UP', NOW() - INTERVAL '7 days'),
('pvt-038', 'usr-001', 'pst-17', 'UP', NOW() - INTERVAL '1 day'),
('pvt-039', 'usr-009', 'pst-17', 'UP', NOW() - INTERVAL '1 day')
ON CONFLICT ("userId", "postId") DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. GŁOSOWANIA NA KOMENTARZE (CommentVote)
-- ---------------------------------------------------------------------------

INSERT INTO "CommentVote" (id, "userId", "commentId", value, "createdAt") VALUES
('cvt-001', 'usr-003', 'cmt-01', 'UP', NOW() - INTERVAL '73 days'),
('cvt-002', 'usr-005', 'cmt-01', 'UP', NOW() - INTERVAL '73 days'),
('cvt-003', 'usr-001', 'cmt-01', 'UP', NOW() - INTERVAL '72 days'),
('cvt-004', 'usr-007', 'cmt-04', 'UP', NOW() - INTERVAL '58 days'),
('cvt-005', 'usr-001', 'cmt-04', 'UP', NOW() - INTERVAL '58 days'),
('cvt-006', 'usr-009', 'cmt-05', 'UP', NOW() - INTERVAL '57 days'),
('cvt-007', 'usr-003', 'cmt-07', 'UP', NOW() - INTERVAL '43 days'),
('cvt-008', 'usr-008', 'cmt-07', 'UP', NOW() - INTERVAL '43 days'),
('cvt-009', 'usr-013', 'cmt-09', 'UP', NOW() - INTERVAL '28 days'),
('cvt-010', 'usr-015', 'cmt-09', 'UP', NOW() - INTERVAL '27 days'),
('cvt-011', 'usr-017', 'cmt-12', 'UP', NOW() - INTERVAL '18 days'),
('cvt-012', 'usr-019', 'cmt-12', 'UP', NOW() - INTERVAL '17 days'),
('cvt-013', 'usr-001', 'cmt-14', 'UP', NOW() - INTERVAL '8 days'),
('cvt-014', 'usr-004', 'cmt-16', 'UP', NOW() - INTERVAL '7 days'),
('cvt-015', 'usr-012', 'cmt-21', 'UP', NOW() - INTERVAL '19 hours')
ON CONFLICT ("userId", "commentId") DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. WIADOMOŚCI PRYWATNE
-- ---------------------------------------------------------------------------

INSERT INTO "Message" (id, "senderId", "receiverId", content, "readAt", "createdAt") VALUES

-- Kursant → Instruktor (pytanie o kurs)
('msg-001', 'usr-001', 'adm-001',
 'Cześć Marku! Mam pytanie dotyczące lekcji 3 — przy kalibracji Live Z mój wydruk ma "elephant foot" na pierwszej warstwie mimo że wartość ustawiłem na -0.05. Czy powinienem jeszcze bardziej wcisnąć?',
 NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days'),
('msg-002', 'adm-001', 'usr-001',
 'Hej Piotrek! Tak, wartość ujemna oznacza że dysza jest bliżej stołu. Spróbuj -0.08 do -0.12 i zrób wydruk testowy (np. mały kwadrat 2x2cm tylko z pierwszą warstwą). Idealnie powinna być lekko "wgnieciona" w stół, nie wypukła.',
 NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
('msg-003', 'usr-001', 'adm-001',
 'Dzięki! Ustawiłem -0.10 i jest perfekcyjnie. Pierwsza warstwa jak lustro 😄',
 NOW() - INTERVAL '79 days', NOW() - INTERVAL '78 days'),

-- Kursant → Instruktor (pytanie o filament)
('msg-004', 'usr-002', 'adm-002',
 'Hej Anno! Mam pytanie — jaką temperaturę ustawić dla PETG w trybie wazonu? Próbowałam 240°C ale wazon wychodzi z lekką teksturą, nie jest gładki.',
 NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days'),
('msg-005', 'adm-002', 'usr-002',
 'Cześć Kasiu! W trybie wazonu spróbuj 235°C i prędkość 40–50mm/s. Przy wyższej prędkości PETG nie ma czasu dobrze się "przykleić" do poprzedniej warstwy. Też możesz spróbować włączyć ironing dla zewnętrznych powierzchni (tylko jeśli nie jesteś w vase mode) — wygładza powierzchnię cudownie.',
 NOW() - INTERVAL '70 days', NOW() - INTERVAL '69 days'),

-- Kursant ↔ Kursant
('msg-006', 'usr-003', 'usr-005',
 'Hej Michał! Widziałem Twój tip o presecie Speed — super! Czy to działa też dla PETG czy tylko dla PLA?',
 NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days'),
('msg-007', 'usr-005', 'usr-003',
 'Dla PETG bym ostrożniej — PETG potrzebuje trochę wolniejszej prędkości dla zewnętrznych ścian (max 80mm/s), bo inaczej wychodzi brzydszy stringing. Dla wypełnienia można dać 200-250mm/s bez problemu.',
 NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),
('msg-008', 'usr-003', 'usr-005',
 'Super, dzięki! Czy możesz mi przesłać swoje ustawienia profilu? Na Bambu Studio można eksportować preset do pliku.',
 NOW() - INTERVAL '67 days', NOW() - INTERVAL '66 days'),
('msg-009', 'usr-005', 'usr-003',
 'Jasne! Niestety przez wiadomości nie mogę wysłać pliku, ale w tym tygodniu zrobię post w społeczności z screenshotami wszystkich ustawień. Zostaw lajka żebyś wiedział gdy wrzucę 😄',
 NOW() - INTERVAL '66 days', NOW() - INTERVAL '65 days'),

-- Instruktor → kursant (feedback do projektu)
('msg-010', 'adm-001', 'usr-004',
 'Cześć Agnieszka! Widziałem Twój post z wieszakiem na słuchawki — świetna robota! Mam dla Ciebie jedno ulepszenie: dodaj zaokrąglenia (fillet) na ostrych krawędziach od spodu — zwiększy adhezję i wygląda bardziej profesjonalnie. Jak skończyć rozdział 4 to się to robi szybko.',
 NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
('msg-011', 'usr-004', 'adm-001',
 'O, nie pomyślałam o tym! Już poprawiam i wydrukuję wersję v2. Dziękuję za wskazówkę!',
 NOW() - INTERVAL '47 days', NOW() - INTERVAL '47 days'),

-- Kursant → kursant (o konkursie)
('msg-012', 'usr-011', 'usr-015',
 'Hej Paweł! Widziałeś ogłoszenie o konkursie? Myślę żeby zgłosić mój organizer do warsztatu. Ty co zamierzasz drukować?',
 NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('msg-013', 'usr-015', 'usr-011',
 'Tak, już się zgłosiłem! Drukuję właśnie stojak na narzędzia z magnetycznym uchwytem. Będzie gotowy jutro. Powodzenia z organizerami, brzmiały imponująco!',
 NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

-- Kursant → Instruktor (pytanie ogólne)
('msg-014', 'usr-016', 'adm-002',
 'Dzień dobry! Jestem na lekcji 9 i nie mogę znaleźć opcji "Wipe on layer change" w Bambu Studio. Czy to jest ukryte ustawienie? Mam wersję 1.9.',
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('msg-015', 'adm-002', 'usr-016',
 'Hej Sylwia! Ta opcja jest w zakładce "Filament" → "Retraction" → "Wipe while retracting". W wersji 1.9 przeniesiono ją z głównych ustawień. Znajdziesz ją też pod nazwą "Wipe Distance" w sekcji retraction.',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('msg-016', 'usr-016', 'adm-002',
 'Znalazłam! Dziękuję bardzo, lekcja 10 o podpórach jest naprawdę świetna, wreszcie rozumiem kiedy ich używać.',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),

-- Ostatnie wiadomości (dziś)
('msg-017', 'usr-020', 'adm-001',
 'Cześć! Właśnie zaczęłam kurs 3 dni temu i jestem po lekcji 6. Mam wrażenie że idzie mi szybko — czy to normalne? Czuję że rozumiem materiał 😊',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('msg-018', 'adm-001', 'usr-020',
 'Ola, to fantastycznie! Każdy ma swoje tempo i jeśli Ci idzie sprawnie to super. Polecam po każdej lekcji zrobić małe ćwiczenie praktyczne zamiast od razu lecieć dalej — wiedza "zatrzymuje się" lepiej. Powodzenia, masz zdolności!',
 NOW() - INTERVAL '22 hours', NOW() - INTERVAL '22 hours')

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. POSTĘP W NAUCE (LessonProgress)
-- ---------------------------------------------------------------------------

-- usr-001 (Piotr) — wszystkie lekcje ukończone, oceniał wszystkie
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "ratingComment", "createdAt", "updatedAt") VALUES
('prg-001-01', 'usr-001', 'les-01', TRUE, 1820, 5, 'Świetne wprowadzenie, od razu wiedziałem o co chodzi z FDM.', NOW() - INTERVAL '88 days', NOW()),
('prg-001-02', 'usr-001', 'les-02', TRUE, 2340, 5, NULL, NOW() - INTERVAL '87 days', NOW()),
('prg-001-03', 'usr-001', 'les-03', TRUE, 1980, 5, 'Kalibracja na początku mnie przeraziła, ale po tej lekcji było łatwo.', NOW() - INTERVAL '86 days', NOW()),
('prg-001-04', 'usr-001', 'les-04', TRUE, 1560, 4, NULL, NOW() - INTERVAL '85 days', NOW()),
('prg-001-05', 'usr-001', 'les-05', TRUE, 2100, 5, NULL, NOW() - INTERVAL '83 days', NOW()),
('prg-001-06', 'usr-001', 'les-06', TRUE, 1800, 5, 'Nareszcie rozumiem dlaczego PETG jest trudniejszy.', NOW() - INTERVAL '82 days', NOW()),
('prg-001-07', 'usr-001', 'les-07', TRUE, 1440, 4, NULL, NOW() - INTERVAL '80 days', NOW()),
('prg-001-08', 'usr-001', 'les-08', TRUE, 2520, 5, NULL, NOW() - INTERVAL '78 days', NOW()),
('prg-001-09', 'usr-001', 'les-09', TRUE, 3120, 5, 'Najlepsza lekcja kursu — wszystko po kolei i z przykładami.', NOW() - INTERVAL '76 days', NOW()),
('prg-001-10', 'usr-001', 'les-10', TRUE, 2280, 5, NULL, NOW() - INTERVAL '74 days', NOW()),
('prg-001-11', 'usr-001', 'les-11', TRUE, 1920, 4, NULL, NOW() - INTERVAL '72 days', NOW()),
('prg-001-12', 'usr-001', 'les-12', TRUE, 1680, 5, NULL, NOW() - INTERVAL '70 days', NOW()),
('prg-001-13', 'usr-001', 'les-13', TRUE, 2040, 4, 'Dobry przegląd, chociaż wolałbym więcej czasu na Fusion 360.', NOW() - INTERVAL '68 days', NOW()),
('prg-001-14', 'usr-001', 'les-14', TRUE, 2880, 5, NULL, NOW() - INTERVAL '66 days', NOW()),
('prg-001-15', 'usr-001', 'les-15', TRUE, 2640, 5, NULL, NOW() - INTERVAL '64 days', NOW()),
('prg-001-16', 'usr-001', 'les-16', TRUE, 1560, 5, NULL, NOW() - INTERVAL '62 days', NOW()),
('prg-001-17', 'usr-001', 'les-17', TRUE, 3240, 5, 'Druk wielokolorowy jest uzależniający 😄', NOW() - INTERVAL '58 days', NOW()),
('prg-001-18', 'usr-001', 'les-18', TRUE, 2400, 5, NULL, NOW() - INTERVAL '55 days', NOW()),
('prg-001-19', 'usr-001', 'les-19', TRUE, 2160, 4, NULL, NOW() - INTERVAL '52 days', NOW()),
('prg-001-20', 'usr-001', 'les-20', TRUE, 4200, 5, 'Projekt końcowy był trudny ale bardzo satysfakcjonujący!', NOW() - INTERVAL '50 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "ratingComment"=EXCLUDED."ratingComment", "updatedAt"=NOW();

-- usr-002 (Kasia) — ukończona 15/20 lekcji
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-002-01', 'usr-002', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '83 days', NOW()),
('prg-002-02', 'usr-002', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '82 days', NOW()),
('prg-002-03', 'usr-002', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '81 days', NOW()),
('prg-002-04', 'usr-002', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '80 days', NOW()),
('prg-002-05', 'usr-002', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '78 days', NOW()),
('prg-002-06', 'usr-002', 'les-06', TRUE, 1800, 5, NOW() - INTERVAL '76 days', NOW()),
('prg-002-07', 'usr-002', 'les-07', TRUE, 1440, 4, NOW() - INTERVAL '74 days', NOW()),
('prg-002-08', 'usr-002', 'les-08', TRUE, 2520, 5, NOW() - INTERVAL '72 days', NOW()),
('prg-002-09', 'usr-002', 'les-09', TRUE, 3120, 5, NOW() - INTERVAL '70 days', NOW()),
('prg-002-10', 'usr-002', 'les-10', TRUE, 2280, 4, NOW() - INTERVAL '67 days', NOW()),
('prg-002-11', 'usr-002', 'les-11', TRUE, 1920, 5, NOW() - INTERVAL '64 days', NOW()),
('prg-002-12', 'usr-002', 'les-12', TRUE, 1680, 4, NOW() - INTERVAL '61 days', NOW()),
('prg-002-13', 'usr-002', 'les-13', TRUE, 2040, 5, NOW() - INTERVAL '58 days', NOW()),
('prg-002-14', 'usr-002', 'les-14', TRUE, 2880, 5, NOW() - INTERVAL '55 days', NOW()),
('prg-002-15', 'usr-002', 'les-15', TRUE, 2640, 5, NOW() - INTERVAL '52 days', NOW()),
('prg-002-16', 'usr-002', 'les-16', FALSE, 980, NULL, NOW() - INTERVAL '48 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-003 (Tomek) — 12/20 ukończonych
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-003-01', 'usr-003', 'les-01', TRUE, 1820, 4, NOW() - INTERVAL '78 days', NOW()),
('prg-003-02', 'usr-003', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '77 days', NOW()),
('prg-003-03', 'usr-003', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '76 days', NOW()),
('prg-003-04', 'usr-003', 'les-04', TRUE, 1560, 4, NOW() - INTERVAL '74 days', NOW()),
('prg-003-05', 'usr-003', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '72 days', NOW()),
('prg-003-06', 'usr-003', 'les-06', TRUE, 1800, 4, NOW() - INTERVAL '70 days', NOW()),
('prg-003-07', 'usr-003', 'les-07', TRUE, 1440, 5, NOW() - INTERVAL '67 days', NOW()),
('prg-003-08', 'usr-003', 'les-08', TRUE, 2520, 5, NOW() - INTERVAL '64 days', NOW()),
('prg-003-09', 'usr-003', 'les-09', TRUE, 3120, 4, NOW() - INTERVAL '61 days', NOW()),
('prg-003-10', 'usr-003', 'les-10', TRUE, 2280, 5, NOW() - INTERVAL '57 days', NOW()),
('prg-003-11', 'usr-003', 'les-11', TRUE, 1920, 4, NOW() - INTERVAL '53 days', NOW()),
('prg-003-12', 'usr-003', 'les-12', TRUE, 1680, 5, NOW() - INTERVAL '49 days', NOW()),
('prg-003-13', 'usr-003', 'les-13', FALSE, 1200, NULL, NOW() - INTERVAL '44 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-004 (Agnieszka) — 10/20 ukończonych
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-004-01', 'usr-004', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '73 days', NOW()),
('prg-004-02', 'usr-004', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '72 days', NOW()),
('prg-004-03', 'usr-004', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '70 days', NOW()),
('prg-004-04', 'usr-004', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '68 days', NOW()),
('prg-004-05', 'usr-004', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '65 days', NOW()),
('prg-004-06', 'usr-004', 'les-06', TRUE, 1800, 4, NOW() - INTERVAL '62 days', NOW()),
('prg-004-07', 'usr-004', 'les-07', TRUE, 1440, 5, NOW() - INTERVAL '58 days', NOW()),
('prg-004-08', 'usr-004', 'les-08', TRUE, 2520, 5, NOW() - INTERVAL '54 days', NOW()),
('prg-004-09', 'usr-004', 'les-09', TRUE, 3120, 5, NOW() - INTERVAL '50 days', NOW()),
('prg-004-10', 'usr-004', 'les-10', TRUE, 2280, 4, NOW() - INTERVAL '45 days', NOW()),
('prg-004-11', 'usr-004', 'les-11', FALSE, 890, NULL, NOW() - INTERVAL '40 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-005 (Michał) — 8/20 ukończonych
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-005-01', 'usr-005', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '68 days', NOW()),
('prg-005-02', 'usr-005', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '67 days', NOW()),
('prg-005-03', 'usr-005', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '65 days', NOW()),
('prg-005-04', 'usr-005', 'les-04', TRUE, 1560, 4, NOW() - INTERVAL '63 days', NOW()),
('prg-005-05', 'usr-005', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '60 days', NOW()),
('prg-005-06', 'usr-005', 'les-06', TRUE, 1800, 5, NOW() - INTERVAL '56 days', NOW()),
('prg-005-07', 'usr-005', 'les-07', TRUE, 1440, 4, NOW() - INTERVAL '52 days', NOW()),
('prg-005-08', 'usr-005', 'les-08', TRUE, 2520, 5, NOW() - INTERVAL '47 days', NOW()),
('prg-005-09', 'usr-005', 'les-09', FALSE, 1800, NULL, NOW() - INTERVAL '42 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-006 (Basia) — 6/20
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-006-01', 'usr-006', 'les-01', TRUE, 1820, 4, NOW() - INTERVAL '63 days', NOW()),
('prg-006-02', 'usr-006', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '61 days', NOW()),
('prg-006-03', 'usr-006', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '59 days', NOW()),
('prg-006-04', 'usr-006', 'les-04', TRUE, 1560, 4, NOW() - INTERVAL '56 days', NOW()),
('prg-006-05', 'usr-006', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '52 days', NOW()),
('prg-006-06', 'usr-006', 'les-06', TRUE, 1800, 5, NOW() - INTERVAL '47 days', NOW()),
('prg-006-07', 'usr-006', 'les-07', FALSE, 720, NULL, NOW() - INTERVAL '42 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-010 (Monika) — 5/20
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-010-01', 'usr-010', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '43 days', NOW()),
('prg-010-02', 'usr-010', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '41 days', NOW()),
('prg-010-03', 'usr-010', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '39 days', NOW()),
('prg-010-04', 'usr-010', 'les-04', TRUE, 1560, 4, NOW() - INTERVAL '36 days', NOW()),
('prg-010-05', 'usr-010', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '32 days', NOW()),
('prg-010-06', 'usr-010', 'les-06', FALSE, 560, NULL, NOW() - INTERVAL '28 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-014 (Magda) — 4/20
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-014-01', 'usr-014', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '23 days', NOW()),
('prg-014-02', 'usr-014', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '22 days', NOW()),
('prg-014-03', 'usr-014', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '20 days', NOW()),
('prg-014-04', 'usr-014', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '18 days', NOW()),
('prg-014-05', 'usr-014', 'les-05', FALSE, 840, NULL, NOW() - INTERVAL '15 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-019 (Robert) — 3/20
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-019-01', 'usr-019', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '6 days', NOW()),
('prg-019-02', 'usr-019', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '5 days', NOW()),
('prg-019-03', 'usr-019', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '3 days', NOW()),
('prg-019-04', 'usr-019', 'les-04', FALSE, 600, NULL, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- usr-020 (Ola) — 2/20 (nowa kursantka)
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-020-01', 'usr-020', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '2 days', NOW()),
('prg-020-02', 'usr-020', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '1 day', NOW()),
('prg-020-03', 'usr-020', 'les-03', FALSE, 420, NULL, NOW() - INTERVAL '3 hours', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- Kilka postępów dla pozostałych użytkowników (lekcje 1–3)
INSERT INTO "LessonProgress" (id, "userId", "lessonId", completed, "watchedSeconds", rating, "createdAt", "updatedAt") VALUES
('prg-007-01', 'usr-007', 'les-01', TRUE, 1820, 4, NOW() - INTERVAL '58 days', NOW()),
('prg-007-02', 'usr-007', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '56 days', NOW()),
('prg-007-03', 'usr-007', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '54 days', NOW()),
('prg-007-04', 'usr-007', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '51 days', NOW()),
('prg-007-05', 'usr-007', 'les-05', FALSE, 900, NULL, NOW() - INTERVAL '48 days', NOW()),
('prg-008-01', 'usr-008', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '53 days', NOW()),
('prg-008-02', 'usr-008', 'les-02', TRUE, 2340, 4, NOW() - INTERVAL '51 days', NOW()),
('prg-008-03', 'usr-008', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '49 days', NOW()),
('prg-008-04', 'usr-008', 'les-04', FALSE, 780, NULL, NOW() - INTERVAL '46 days', NOW()),
('prg-009-01', 'usr-009', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '48 days', NOW()),
('prg-009-02', 'usr-009', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '46 days', NOW()),
('prg-009-03', 'usr-009', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '44 days', NOW()),
('prg-009-04', 'usr-009', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '41 days', NOW()),
('prg-009-05', 'usr-009', 'les-05', TRUE, 2100, 4, NOW() - INTERVAL '38 days', NOW()),
('prg-009-06', 'usr-009', 'les-06', FALSE, 650, NULL, NOW() - INTERVAL '34 days', NOW()),
('prg-011-01', 'usr-011', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '38 days', NOW()),
('prg-011-02', 'usr-011', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '36 days', NOW()),
('prg-011-03', 'usr-011', 'les-03', TRUE, 1980, 5, NOW() - INTERVAL '34 days', NOW()),
('prg-011-04', 'usr-011', 'les-04', TRUE, 1560, 4, NOW() - INTERVAL '32 days', NOW()),
('prg-011-05', 'usr-011', 'les-05', TRUE, 2100, 5, NOW() - INTERVAL '29 days', NOW()),
('prg-011-06', 'usr-011', 'les-06', TRUE, 1800, 4, NOW() - INTERVAL '26 days', NOW()),
('prg-011-07', 'usr-011', 'les-07', FALSE, 820, NULL, NOW() - INTERVAL '22 days', NOW()),
('prg-012-01', 'usr-012', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '33 days', NOW()),
('prg-012-02', 'usr-012', 'les-02', TRUE, 2340, 4, NOW() - INTERVAL '31 days', NOW()),
('prg-012-03', 'usr-012', 'les-03', FALSE, 890, NULL, NOW() - INTERVAL '28 days', NOW()),
('prg-013-01', 'usr-013', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '28 days', NOW()),
('prg-013-02', 'usr-013', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '26 days', NOW()),
('prg-013-03', 'usr-013', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '24 days', NOW()),
('prg-013-04', 'usr-013', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '21 days', NOW()),
('prg-013-05', 'usr-013', 'les-05', FALSE, 760, NULL, NOW() - INTERVAL '18 days', NOW()),
('prg-015-01', 'usr-015', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '18 days', NOW()),
('prg-015-02', 'usr-015', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '16 days', NOW()),
('prg-015-03', 'usr-015', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '14 days', NOW()),
('prg-015-04', 'usr-015', 'les-04', TRUE, 1560, 5, NOW() - INTERVAL '11 days', NOW()),
('prg-015-05', 'usr-015', 'les-05', FALSE, 420, NULL, NOW() - INTERVAL '8 days', NOW()),
('prg-016-01', 'usr-016', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '16 days', NOW()),
('prg-016-02', 'usr-016', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '14 days', NOW()),
('prg-016-03', 'usr-016', 'les-03', TRUE, 1980, 4, NOW() - INTERVAL '12 days', NOW()),
('prg-016-04', 'usr-016', 'les-04', FALSE, 540, NULL, NOW() - INTERVAL '9 days', NOW()),
('prg-017-01', 'usr-017', 'les-01', TRUE, 1820, 4, NOW() - INTERVAL '12 days', NOW()),
('prg-017-02', 'usr-017', 'les-02', TRUE, 2340, 5, NOW() - INTERVAL '11 days', NOW()),
('prg-017-03', 'usr-017', 'les-03', FALSE, 960, NULL, NOW() - INTERVAL '9 days', NOW()),
('prg-018-01', 'usr-018', 'les-01', TRUE, 1820, 5, NOW() - INTERVAL '9 days', NOW()),
('prg-018-02', 'usr-018', 'les-02', TRUE, 2340, 4, NOW() - INTERVAL '7 days', NOW()),
('prg-018-03', 'usr-018', 'les-03', FALSE, 380, NULL, NOW() - INTERVAL '5 days', NOW())
ON CONFLICT ("userId", "lessonId") DO UPDATE SET completed=EXCLUDED.completed, "watchedSeconds"=EXCLUDED."watchedSeconds", rating=EXCLUDED.rating, "updatedAt"=NOW();

-- ---------------------------------------------------------------------------
-- 11. WIKI ARTYKUŁY
-- ---------------------------------------------------------------------------

INSERT INTO "WikiArticle" (id, title, slug, content, category, "authorId", published, "createdAt", "updatedAt") VALUES

('wki-01',
 'Parametry druku — kompletny przewodnik',
 'parametry-druku-przewodnik',
 '<h2>Layer Height (Wysokość warstwy)</h2><p>Wysokość warstwy ma największy wpływ na czas druku i jakość powierzchni. Standardowo używaj 0.2mm dla dobrego balansu. Dla detali: 0.1mm. Dla szybkich wydruków użytkowych: 0.28–0.3mm.</p><h2>Infill (Wypełnienie)</h2><p>15–20% — modele dekoracyjne, figurki. 30–40% — elementy użytkowe, uchwyty. 60%+ — części mechaniczne pod obciążeniem.</p><h2>Prędkość druku</h2><p>Bambu Lab A1 Mini obsługuje do 500mm/s, ale dla jakości zaleca się: zewnętrzne ściany 100–150mm/s, wypełnienie 200–300mm/s. Preset "Quality" automatycznie dobiera odpowiednie wartości.</p><h2>Temperatura dyszy</h2><p>PLA: 205–215°C. PETG: 230–240°C. TPU: 220–235°C. Zawsze wykonaj calibration test po zmianie filamentu.</p>',
 'Parametry i ustawienia',
 'adm-001', TRUE, NOW() - INTERVAL '155 days', NOW()),

('wki-02',
 'Rozwiązywanie problemów z drukiem — troubleshooting',
 'troubleshooting',
 '<h2>Stringing (nitkowanie)</h2><p>Przyczyna: zbyt wysoka temperatura lub zbyt wolna prędkość travel. Rozwiązanie: obniż temperaturę o 5°C, zwiększ retraction speed do 40mm/s, włącz "Wipe on layer change".</p><h2>Layer Shifting (przesunięcia warstw)</h2><p>Przyczyna: za wysoka prędkość, luźne paski napędowe lub wibracje zewnętrzne. Rozwiązanie: sprawdź napięcie pasków, zmniejsz prędkość do 80% presetu.</p><h2>Warping (odklejanie)</h2><p>Przyczyna: zbyt szybkie chłodzenie dolnych warstw. Rozwiązanie: Brim 8mm, temperatura stołu +5°C, zmniejsz prędkość wentylatora dla pierwszych 5 warstw.</p><h2>Under-extrusion</h2><p>Przyczyna: zatkana dysza lub wilgotny filament. Rozwiązanie: Cold Pull, wysusz filament 6h w 65°C.</p>',
 'Rozwiązywanie problemów',
 'adm-001', TRUE, NOW() - INTERVAL '140 days', NOW()),

('wki-03',
 'Filamenty — porównanie PLA vs PETG vs TPU',
 'filamenty-porownanie',
 '<h2>PLA</h2><p>Temperatura druku: 200–220°C. Temperatura stołu: 55–65°C. Łatwy w druku, nie wymaga obudowy. Biodegradowalny. Słaba odporność na ciepło (odkształca się od ~60°C). Idealny na: figurki, dekoracje, prototypy, modele edukacyjne.</p><h2>PETG</h2><p>Temperatura druku: 228–240°C. Temperatura stołu: 70–85°C. Wytrzymały, odporny na ciepło do ~80°C, lekko elastyczny. Trudniejszy w druku (stringing). Idealny na: części mechaniczne, obudowy elektroniki, elementy na zewnątrz.</p><h2>TPU</h2><p>Temperatura druku: 220–235°C. Temperatura stołu: 25–40°C. Elastyczny, gumowy. Wolniejszy druk (max 30–40mm/s). Idealny na: uszczelki, osłony, elementy amortyzujące.</p>',
 'Materiały',
 'adm-002', TRUE, NOW() - INTERVAL '120 days', NOW()),

('wki-04',
 'Kalibracja Bambu Lab A1 Mini — krok po kroku',
 'kalibracja-a1-mini',
 '<h2>Automatyczna kalibracja (zalecana)</h2><p>Bambu Lab A1 Mini ma wbudowany system automatycznej kalibracji który uruchamia się przed każdym wydrukiem lub na żądanie. Menu → Kalibracja → Pełna kalibracja.</p><h2>Live Adjust Z</h2><p>Podczas druku pierwszej warstwy możesz na żywo dostosować odległość dyszy od stołu. Idealnie: pierwsza warstwa powinna być lekko "wciśnięta" ale widoczna. Wartość standardowo -0.05 do -0.15mm.</p><h2>Flow Calibration</h2><p>Co kilka szpul przeprowadź kalibrację flow — drukarka drukuje wzorzec i mierzy optycznie. Zapewnia dokładność wymiarową wydruków.</p><h2>Vibracja / Resonance Compensation</h2><p>A1 Mini automatycznie kompensuje wibracje. Kalibrację należy powtórzyć gdy zmienisz miejsce ustawienia drukarki lub po wymianie paska napędowego.</p>',
 'Ustawienia drukarki',
 'adm-001', TRUE, NOW() - INTERVAL '100 days', NOW()),

('wki-05',
 'Druk wielokolorowy z AMS Lite — jak zacząć',
 'druk-wielokolorowy-ams-lite',
 '<h2>Załadowanie filamentów do AMS Lite</h2><p>AMS Lite obsługuje do 4 szpul jednocześnie. Każda szpula jest identyfikowana numerem slotu (1–4). Filamenty muszą być kompatybilne temperaturowo — nie mieszaj PLA z PETG w jednym wydruku wielokolorowym.</p><h2>Konfiguracja w Bambu Studio</h2><p>1. Dodaj model → Kliknij prawym na model → "Split to Objects" jeśli to model wieloczęściowy. 2. Przypisz kolor do każdego obiektu. 3. Bambu Studio automatycznie wygeneruje "Flush" (purgowanie) między zmianami. 4. Sprawdź podgląd kolorów przed wysłaniem.</p><h2>Ilość purgowania</h2><p>Przy zmianie z ciemnego na jasny kolor: ustaw flush minimum 150mm³. Przy zmianie z jasnego na ciemny: wystarczy 50–80mm³. Nadmiar zwiększa czas druku, ale za mała ilość = krzyżowanie kolorów.</p>',
 'Zaawansowane techniki',
 'adm-002', TRUE, NOW() - INTERVAL '60 days', NOW())

ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 12. ZGŁOSZENIA DO SUPPORTU (przykładowe)
-- ---------------------------------------------------------------------------

INSERT INTO "SupportTicket" (id, "userId", type, message, "pageUrl", resolved, "createdAt") VALUES
('tkt-01', 'usr-007', 'BUG',
 'Na stronie lekcji 9 timer nie działał gdy wróciłem z menu — wydruk się zatrzymał ale czas był zatrzymany na 45min.',
 '/kurs/les-09', TRUE, NOW() - INTERVAL '55 days'),
('tkt-02', 'usr-010', 'HELP',
 'Jak mogę pobrać materiały do lekcji 14? Widzę że inne osoby mają pliki STL ale nie mogę ich znaleźć.',
 '/kurs/les-14', TRUE, NOW() - INTERVAL '40 days'),
('tkt-03', 'usr-015', 'FEATURE',
 'Byłoby super gdyby można było robić notatki wideo — zatrzymać odtwarzanie i dodać notatkę do konkretnego momentu. Albo przynajmniej eksportować swoje notatki do PDF.',
 '/kurs/les-09', FALSE, NOW() - INTERVAL '20 days'),
('tkt-04', 'usr-018', 'HELP',
 'Nie mogę zmienić nazwy użytkownika — klikam "Zapisz" ale nic się nie dzieje. Sprawdziłem w dwóch przeglądarkach.',
 '/profile', FALSE, NOW() - INTERVAL '7 days'),
('tkt-05', 'usr-020', 'OTHER',
 'Czy kurs będzie miał kontynuację z bardziej zaawansowanym modelowaniem? Np. Fusion 360 od podstaw?',
 '/dashboard', FALSE, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =============================================================================
-- PODSUMOWANIE
-- =============================================================================
-- Uruchom poniższe SELECT aby zweryfikować dane:

SELECT 'Użytkownicy' AS tabela, COUNT(*) AS liczba FROM "User"
UNION ALL SELECT 'Rozdziały', COUNT(*) FROM "Chapter"
UNION ALL SELECT 'Lekcje', COUNT(*) FROM "Lesson"
UNION ALL SELECT 'Kategorie postów', COUNT(*) FROM "Category"
UNION ALL SELECT 'Ogłoszenia', COUNT(*) FROM "Announcement"
UNION ALL SELECT 'Posty', COUNT(*) FROM "Post"
UNION ALL SELECT 'Komentarze', COUNT(*) FROM "Comment"
UNION ALL SELECT 'Wiadomości', COUNT(*) FROM "Message"
UNION ALL SELECT 'Postępy lekcji', COUNT(*) FROM "LessonProgress"
UNION ALL SELECT 'Wiki artykuły', COUNT(*) FROM "WikiArticle"
UNION ALL SELECT 'Zgłoszenia support', COUNT(*) FROM "SupportTicket";
