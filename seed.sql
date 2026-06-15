BEGIN;

WITH inserted_chapters AS (
  INSERT INTO "Chapter" (id, title, description, "order")
  VALUES
    (gen_random_uuid()::text, 'MODUŁ 0 — Wprowadzenie do kursu', '3 lekcje | ~45 min', 0),
    (gen_random_uuid()::text, 'MODUŁ 1 — Rozpakowywanie i pierwsze uruchomienie', '7 lekcji | ~2,5 godz', 1),
    (gen_random_uuid()::text, 'MODUŁ 2 — Twój pierwszy wydruk', '5 lekcji | ~2 godz', 2),
    (gen_random_uuid()::text, 'MODUŁ 3 — Jak działa drukarka 3D — teoria i budowa', '8 lekcji | ~3 godz', 3),
    (gen_random_uuid()::text, 'MODUŁ 4 — Materiały do druku 3D', '9 lekcji | ~3,5 godz', 4),
    (gen_random_uuid()::text, 'MODUŁ 5 — Bambu Studio — podstawy', '8 lekcji | ~3,5 godz', 5),
    (gen_random_uuid()::text, 'MODUŁ 6 — Bambu Studio — zaawansowane funkcje', '9 lekcji | ~4 godz', 6),
    (gen_random_uuid()::text, 'MODUŁ 7 — Znajdowanie i zarządzanie modelami 3D', '6 lekcji | ~2 godz', 7),
    (gen_random_uuid()::text, 'MODUŁ 8 — Projektowanie własnych modeli — TinkerCAD', '9 lekcji | ~4,5 godz', 8),
    (gen_random_uuid()::text, 'MODUŁ 9 — Post-processing — obróbka po wydruku', '7 lekcji | ~3 godz', 9),
    (gen_random_uuid()::text, 'MODUŁ 10 — Konserwacja drukarki', '7 lekcji | ~2,5 godz', 10),
    (gen_random_uuid()::text, 'MODUŁ 11 — Zaawansowana kalibracja i fine-tuning', '6 lekcji | ~3 godz', 11),
    (gen_random_uuid()::text, 'MODUŁ 12 — Rozwiązywanie problemów', '10 lekcji | ~4 godz', 12),
    (gen_random_uuid()::text, 'MODUŁ 13 — Druk wielokolorowy (poglądowo)', '2 lekcje | ~45 min', 13),
    (gen_random_uuid()::text, 'MODUŁ 14 — Praktyczne zastosowania druku 3D', '7 lekcji | ~3 godz', 14),
    (gen_random_uuid()::text, 'MODUŁ 15 — Projekt końcowy i dalszy rozwój', '5 lekcji | ~2,5 godz', 15)
  RETURNING id, "order"
)
INSERT INTO "Lesson" (id, "chapterId", title, description, "order")
SELECT gen_random_uuid()::text, c.id, l.title, l.description, l."order"
FROM inserted_chapters c
JOIN (VALUES
  (0, 1, 'Witaj w kursie!', 'Jak kurs jest zorganizowany, czego się nauczysz. Przegląd platformy: lekcje, quizy, wyzwania, forum.'),
  (0, 2, 'Co jest w zestawie i co będziesz drukować', 'Zawartość zestawu: A1 Mini + PLA 1 kg + PETG 1 kg. Galeria wydruków z kursu.'),
  (0, 3, 'Konto Bambu Lab i aplikacje', 'Rejestracja konta, Bambu Handy na smartfon, Bambu Studio na komputer.'),

  (1, 1, 'Rozpakowywanie A1 Mini', 'Kolejność otwierania pudełka. Lista kontrolna zabezpieczeń do usunięcia przed uruchomieniem.'),
  (1, 2, 'Montaż ramienia i przygotowanie miejsca', 'Podłączenie ramienia filamentu. Stabilna powierzchnia, min. 15°C, brak przeciągów.'),
  (1, 3, 'Pierwsze włączenie i konfiguracja', 'Włączanie, wybór języka, WiFi. Rejestracja drukarki w koncie Bambu Lab.'),
  (1, 4, 'Auto-kalibracja krok po kroku', 'Poziomowanie łoża, kalibracja przepływu, kompensacja wibracji. Czas ~10-15 min.'),
  (1, 5, 'Załadowanie filamentu PLA', 'Przygotowanie końcówki, wprowadzenie do podajnika, podgrzanie dyszy do ~220°C.'),
  (1, 6, 'Wstępne smarowanie osi Z', 'Dlaczego smarowanie od początku przedłuża żywotność. Smar na śrubę pociągową Z.'),
  (1, 7, 'Problemy przy pierwszym uruchomieniu', 'WiFi, kalibracja, ekran dotykowy. Gdzie szukać pomocy.'),

  (2, 1, 'Drukowanie przez Bambu Handy (smartfon)', '3D Benchy z MakerWorld. Monitorowanie przez kamerę w Bambu Handy.'),
  (2, 2, 'Instalacja i pierwsze kroki w Bambu Studio', 'Import drag-and-drop, slicowanie i wysyłanie przez WiFi.'),
  (2, 3, 'Ekran dotykowy drukarki — mapa interfejsu', 'Status, temperatura, filament, sterowanie osiami, stop/wznów.'),
  (2, 4, 'Podgląd wydruku w Bambu Studio', 'Warstwy, czas, zużycie filamentu, Layer View, kolory infill.'),
  (2, 5, 'Wyjmowanie wydruku i ocena jakości', 'Chłodzenie do ~40°C, zginanie płyty, ocena pierwszego wydruku.'),

  (3, 1, 'Technologia FDM — jak powstaje wydruk warstwa po warstwie', 'Model 3D → slicer → G-code → druk. Konsekwencje druku warstwowego.'),
  (3, 2, 'Słownik pojęć druku 3D', 'Ekstruzja, retraction, stringing, warping, overhang, bridge, infill, perimeter, z-seam.'),
  (3, 3, 'Osie X, Y, Z — jak drukarka się porusza', 'Ruch głowicy X, łoża Y. Naprężenie pasków. Prędkość vs jakość.'),
  (3, 4, 'Hotend, dysza, ekstruder — jak filament trafia na model', 'Szpula → podajnik → PTFE → hotend → dysza. Temperatura druku vs łoża.'),
  (3, 5, 'Dysze — rozmiary i materiały', '0.2/0.4/0.6/0.8 mm. Mosiądz vs hartowana. PLA vs filamenty z włóknami.'),
  (3, 6, 'Płyta robocza — typy, dobór, pielęgnacja', 'Textured PEI vs Smooth PEI. IPA, klej, czyszczenie.'),
  (3, 7, 'Temperatura łoża — rola i optymalne wartości', 'PLA ~55-60°C, PETG ~70-80°C. Warping i przeciągi.'),
  (3, 8, 'AMS lite — co to jest i kiedy się przydaje', 'Druk w 4 kolorach, podajnik zapasowy. Kiedy warto dokupić.'),

  (4, 1, 'Jak wybierać filament do projektu', 'Tabela PLA vs PETG vs TPU vs ASA. Framework: zastosowanie → właściwości → filament.'),
  (4, 2, 'PLA — filament z którego zaczniesz', '210-220°C, odkształcanie od ~55-60°C. Przechowywanie z silica gel.'),
  (4, 3, 'Warianty PLA', 'Silk, Matte, Glow, CF. Kiedy stosować, zmiana ustawień, dysza hartowana dla CF.'),
  (4, 4, 'PETG — gdy potrzebujesz czegoś mocniejszego', '240-250°C, odporność do ~80°C. Zastosowania mechaniczne.'),
  (4, 5, 'TPU — elastyczny filament', 'Gumopodobna faktura, odporność na ścieranie. Trudności druku.'),
  (4, 6, 'Zaawansowane materiały: ASA, ABS, PA', 'Kiedy i dlaczego. Wyższe temperatury, warping, zamknięta komora.'),
  (4, 7, 'Wilgoć — największy wróg filamentu', 'Trzaski, pęcherzyki, stringing. Suszenie w piekarniku lub suszarce.'),
  (4, 8, 'Profile filamentów w Bambu Studio', 'Wbudowane profile, marketplace, ręczna konfiguracja temperatury.'),
  (4, 9, 'Tagi RFID w szpulach Bambu Lab', 'Automatyczne rozpoznawanie, szpule bez RFID, ekologiczne kartony.'),

  (5, 1, 'Interfejs Bambu Studio — mapa programu', 'Pasek narzędzi, panel obiektu, zakładki Global/Object/Layer, skróty.'),
  (5, 2, 'Import i zarządzanie modelami na płycie', 'STL i 3MF, kopie, skalowanie, obracanie, Auto-arrange, zapis 3MF.'),
  (5, 3, 'Orientacja modelu', 'Płaskie powierzchnie na dole, minimalizacja nawisów, Auto-orient, wytrzymałość.'),
  (5, 4, 'Infill — wytrzymałość vs. zużycie materiału', '0-100%, Grid/Gyroid/Honeycomb/Lightning. Liczba ścianek.'),
  (5, 5, 'Wysokość warstwy (Layer Height)', '0.1 mm (wysoka jakość), 0.2 mm (standard), 0.3 mm (szybki). Adaptive.'),
  (5, 6, 'Podpory (Support)', 'Normal vs Tree Support, Support Painting, Interface layer.'),
  (5, 7, 'Prędkość druku', 'Normal, Sport, Ludicrous. Pierwsze warstwy wolno, perimetry wolniej.'),
  (5, 8, 'Samodzielny dobór ustawień — projekt z PLA', 'Uchwyt na słuchawki: orientacja, infill, layer height, support.'),

  (6, 1, 'Modifier meshes — różne ustawienia w różnych częściach modelu', 'Wyższy infill tylko w miejscu naprężeń.'),
  (6, 2, 'Ironing — perfekcyjnie gładka górna powierzchnia', 'Przejazd bez ekstruzji. Kiedy włączyć. +10-30% czasu.'),
  (6, 3, 'Variable Layer Height', 'Adaptive Layer Height: grubsza na prostych, cieńsza na detalach.'),
  (6, 4, 'Support Painting — precyzyjna kontrola podpór', 'Paint Support vs Paint Anti-Support. Minimalizacja supportu.'),
  (6, 5, 'Fuzzy Skin — teksturowane powierzchnie', 'Parametry: gęstość, grubość. Zastosowania estetyczne.'),
  (6, 6, 'Cut Tool — dzielenie modeli większych niż płyta', '180×180×180 mm limit. Dove-tail connector. Klejenie po wydruku.'),
  (6, 7, 'G-code — co to jest i kiedy go eksportować', 'Podstawowe komendy G1/G28/M104. Export, modyfikacja start/end.'),
  (6, 8, 'Drukowanie z karty SD i przez LAN', 'Wysunięcie karty SD, kopiowanie G-code, druk bez internetu.'),
  (6, 9, 'Tworzenie własnego profilu druku', 'Kopia standardowego profilu, kalibracja temperatury i flow ratio.'),

  (7, 1, 'MakerWorld — oficjalna biblioteka Bambu Lab', 'Kategorie, filtry, profile druku, program punktowy dla twórców.'),
  (7, 2, 'Inne biblioteki: Printables, Thingiverse, Cults3D', 'Jak oceniać jakość modelu z zewnętrznej biblioteki.'),
  (7, 3, 'Formaty plików 3D — STL, 3MF, OBJ, G-code', 'Różnice. Zawsze zapisuj projekty jako 3MF.'),
  (7, 4, 'Naprawa uszkodzonych plików STL', 'Meshmixer, Netfabb Online. Non-manifold, odwrócone normalne.'),
  (7, 5, 'Zarządzanie własną biblioteką plików', 'Struktura folderów, nazewnictwo, backup w chmurze.'),
  (7, 6, 'Drukowanie modeli G-code z MakerWorld', 'Ready to print, Staff Pick. Zalety i wady gotowego G-code.'),

  (8, 1, 'Dlaczego warto projektować samemu', 'Przykłady: adapter, uchwyt, brakująca część. TinkerCAD vs Fusion 360 vs Blender.'),
  (8, 2, 'TinkerCAD — pierwsze kroki', 'Interfejs, kształty, wymiary, obracanie, grupowanie, odejmowanie (Hole).'),
  (8, 3, 'Precyzyjne wymiarowanie w TinkerCAD', 'Milimetry, wyrównywanie Align, linijka Ruler, dokładne pasowanie.'),
  (8, 4, 'Tekst i personalizacja', 'Tekst 3D wytłoczony/wgłębiony, import SVG, breloczek z imieniem.'),
  (8, 5, 'Tolerancje w druku 3D', 'Skurcz termiczny, +0.2 mm na stronę. Seria testowa otworów M3.'),
  (8, 6, 'Projekt: uchwyt na kabel USB-C do biurka', 'Kompletna sesja: pomiar → TinkerCAD → Bambu Studio → druk.'),
  (8, 7, 'Projekt: pojemnik z pokrywką', 'Zamek wciskany (-0.1 do +0.2 mm), wieloczęściowy model.'),
  (8, 8, 'Import STL do TinkerCAD', 'Modyfikacja gotowych modeli: dodaj napis, mocowanie, otwór.'),
  (8, 9, 'Gdzie iść dalej: Fusion 360 i Blender', 'Kiedy TinkerCAD przestaje wystarczać. Modelowanie parametryczne.'),

  (9, 1, 'Usuwanie supportów i oczyszczanie wydruku', 'Kombinerki, skalpel, pęseta. Technika, ślady po supportach.'),
  (9, 2, 'Szlifowanie — jak wygładzić wydruk', '120→2000 gradacja. Wet sanding. Kiedy warto szlifować.'),
  (9, 3, 'Primer i malowanie wydruków PLA/PETG', 'Primer spray, farby akrylowe, lakier varnish. Kolejność.'),
  (9, 4, 'Klejenie i łączenie wydruków', 'Cyjanoakrylat, epoksyd. Magnesy neodymowe: tolerancja -0.1 do +0.3 mm.'),
  (9, 5, 'Heat-set inserts — trwałe gwinty', 'M3: otwór 4.5 mm × 5.7 mm. Lutownica 200°C. Setki cykli demontażu.'),
  (9, 6, 'Acetone smoothing (informacyjnie)', 'Tylko ABS/ASA. Para acetonu. Bezpieczeństwo: wentylacja, brak ognia.'),
  (9, 7, 'Projekt modułu: od pliku do finalnego produktu', 'TinkerCAD → Bambu Studio → druk → support → szlifowanie → montaż.'),

  (10, 1, 'Plan konserwacji — co i kiedy robić', 'Po wydruku, co 20-30h, co 200-300h. Licznik godzin w Settings.'),
  (10, 2, 'Czyszczenie płyty roboczej — codzienna rutyna', 'Mikrofibra, IPA 99%, woda z detergentem. Czego unikać.'),
  (10, 3, 'Smarowanie osi X, Y i Z', 'Olej vs smar. Procedury dla prowadnic liniowych i śruby pociągowej.'),
  (10, 4, 'Konserwacja głowicy i wycieraczek', 'Ekstruder, wentylator hotend, wipers, nozzle buckle, 4 śruby.'),
  (10, 5, 'Wymiana noża tnącego w ekstruderze', 'Co 10-15 szpul. Krok po kroku, uwaga na ostre krawędzie.'),
  (10, 6, 'Napinanie pasków X i Y', 'Kiedy potrzebne. Procedura. Vibration Compensation Calibration po napięciu.'),
  (10, 7, 'Kalibracje drukarki — kiedy i jak', 'Auto-leveling, Flow, Vibration, Bed Tramming. Po wymianie dyszy.'),

  (11, 1, 'Kalibracja Flow Rate — dokładność wymiarów', 'Single Wall Cube, pomiar suwmiarką. Wzór: nowy = (nominalny/zmierzony)×aktualny.'),
  (11, 2, 'Kalibracja temperatury — Temperature Tower', 'Mosty, stringing, błysk na narożnikach. Optymalna temperatura dla szpuli.'),
  (11, 3, 'Stringing i retraction — eliminacja nitek', 'Direct drive: 0.5-1.5 mm. Z-hop, temperatura, test filarków.'),
  (11, 4, 'Pressure Advance — precyzyjne narożniki', 'PA Tower. Zaokrąglone narożniki lub bulging. Wartość PA.'),
  (11, 5, 'Bridging — drukowanie w powietrzu', 'Prędkość (wolniej=lepiej), temperatura (niżej=szybsze chłodzenie). Bridge Test.'),
  (11, 6, 'Twój profil kalibracyjny — dokumentacja ustawień', 'Zbieranie flow, temp, retraction, PA w jeden profil. Backup.'),

  (12, 1, 'Metodologia debugowania', 'Jedna zmiana naraz. Obserwacja → hipoteza → test. Dokumentacja eksperymentów.'),
  (12, 2, 'Filament nie przykleja się do płyty', 'Tłuszcz, bed level, temp łoża, profil filamentu, przeciąg. Procedura.'),
  (12, 3, 'Model odkleił się w połowie druku', 'Mała podstawa, warping PETG. Brim, wyższe temp łoża, eliminacja przeciągów.'),
  (12, 4, 'Wady powierzchni — stringing, blobs, under-extrusion', 'Diagnoza i parametr do zmiany dla każdej wady.'),
  (12, 5, 'Przesunięcia warstw (Layer Shift)', 'Zderzenie dyszy, paski, prędkość, śruby. Kierunek = wskazanie osi.'),
  (12, 6, 'Nozzle Clumping — grudki na dyszy', 'Detekcja przez sensor, pauza. Włączenie: Print Options → Nozzle Clumping.'),
  (12, 7, 'Zatkana dysza i urwany filament', 'Cold Pull: 190°C PLA, chłódź do 90°C, wyciągnij. Całkowite zatkanie.'),
  (12, 8, 'Nierówna pierwsza warstwa — przyczyny mechaniczne', 'Nozzle buckle, 4 śruby hotend. Procedura sprawdzenia.'),
  (12, 9, 'Kody błędów HMS — jak czytać i reagować', 'QR kod na ekranie. Portal wiki z polskimi opisami.'),
  (12, 10, 'Hierarchia wsparcia — gdzie szukać pomocy', 'Wiki kursu → forum → prywatna wiadomość → wiki Bambu → support.'),

  (13, 1, 'AMS lite — jak działa druk wielokolorowy', '4 kolory jednocześnie, backup filamentu, galeria przykładów.'),
  (13, 2, 'Przygotowanie modelu wielokolorowego w Bambu Studio', 'Color Painting: Fill Tool i Circle Tool. Purge tower.'),

  (14, 1, 'Dom i organizacja — co warto drukować', 'Organizery, uchwyty na kable, haczyki IKEA, adaptery, etykiety.'),
  (14, 2, 'Naprawa i części zamienne', 'Zmierz → TinkerCAD → wydrukuj. PLA vs PETG dla części zamiennych.'),
  (14, 3, 'Prototypowanie', 'Iteracyjny workflow: pomysł → szybki model → test → poprawki. DIY, Arduino.'),
  (14, 4, 'Gadżety, figurki i dekoracje', 'Orientacja figurek, skala, tokeny do gier. Puzzle 3D.'),
  (14, 5, 'Akcesoria dla hobbystów', 'RC, modelarstwo, fotografia, muzyka. MakerWorld i Printables.'),
  (14, 6, 'Zarabianie na druku 3D', 'Etsy, MakerWorld Creator, usługi na zamówienie. Prawa autorskie (NC).'),
  (14, 7, 'Druk 3D w pracy i dla firm', 'Jigs, housing elektroniki, mock-upy. ROI. Certyfikaty food-safe.'),

  (15, 1, 'Projekt końcowy — brief i wymagania', 'Model samodzielnie zaprojektowany, wydrukowany, z opisem. Deadline.'),
  (15, 2, 'Praca nad projektem — sesja warsztatowa', 'Czas na własny projekt. Wskazówki gdy model nie wychodzi.'),
  (15, 3, 'Galeria i peer review projektów', 'Peer review: 4 kryteria, skala 1-5 z komentarzem.'),
  (15, 4, 'Co dalej — ekosystem Bambu Lab', 'P1S, X1C, A1. AMS lite, suszarka. Bambu Maker Program.'),
  (15, 5, 'Podsumowanie kursu', '10 zasad dobrego druku 3D. Długość dostępu. Społeczność kursantów.')
) AS l(chapter_order, "order", title, description)
  ON c."order" = l.chapter_order;

COMMIT;
