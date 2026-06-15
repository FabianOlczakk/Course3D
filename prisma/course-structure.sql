-- Struktura kursu "Druk 3D z Bambu Lab A1 Mini — od zera do eksperta"
-- 16 modułów, 108 lekcji
-- Uruchom w edytorze SQL Supabase

WITH chapter_ids AS (
  SELECT
    gen_random_uuid()::text AS ch0,
    gen_random_uuid()::text AS ch1,
    gen_random_uuid()::text AS ch2,
    gen_random_uuid()::text AS ch3,
    gen_random_uuid()::text AS ch4,
    gen_random_uuid()::text AS ch5,
    gen_random_uuid()::text AS ch6,
    gen_random_uuid()::text AS ch7,
    gen_random_uuid()::text AS ch8,
    gen_random_uuid()::text AS ch9,
    gen_random_uuid()::text AS ch10,
    gen_random_uuid()::text AS ch11,
    gen_random_uuid()::text AS ch12,
    gen_random_uuid()::text AS ch13,
    gen_random_uuid()::text AS ch14,
    gen_random_uuid()::text AS ch15
),
insert_chapters AS (
  INSERT INTO "Chapter" (id, title, description, "order", "createdAt", "updatedAt")
  SELECT v.id, v.title, v.description, v."order", NOW(), NOW()
  FROM (
    VALUES
      ((SELECT ch0 FROM chapter_ids), 'MODUŁ 0 — Wprowadzenie do kursu', '3 lekcje | ~45 min', 0),
      ((SELECT ch1 FROM chapter_ids), 'MODUŁ 1 — Rozpakowywanie i pierwsze uruchomienie', '7 lekcji | ~2,5 godz', 1),
      ((SELECT ch2 FROM chapter_ids), 'MODUŁ 2 — Twój pierwszy wydruk', '5 lekcji | ~2 godz', 2),
      ((SELECT ch3 FROM chapter_ids), 'MODUŁ 3 — Jak działa drukarka 3D — teoria i budowa', '8 lekcji | ~3 godz', 3),
      ((SELECT ch4 FROM chapter_ids), 'MODUŁ 4 — Materiały do druku 3D', '9 lekcji | ~3,5 godz', 4),
      ((SELECT ch5 FROM chapter_ids), 'MODUŁ 5 — Bambu Studio — podstawy', '8 lekcji | ~3,5 godz', 5),
      ((SELECT ch6 FROM chapter_ids), 'MODUŁ 6 — Bambu Studio — zaawansowane funkcje', '9 lekcji | ~4 godz', 6),
      ((SELECT ch7 FROM chapter_ids), 'MODUŁ 7 — Znajdowanie i zarządzanie modelami 3D', '6 lekcji | ~2 godz', 7),
      ((SELECT ch8 FROM chapter_ids), 'MODUŁ 8 — Projektowanie własnych modeli — TinkerCAD', '9 lekcji | ~4,5 godz', 8),
      ((SELECT ch9 FROM chapter_ids), 'MODUŁ 9 — Post-processing — obróbka po wydruku', '7 lekcji | ~3 godz', 9),
      ((SELECT ch10 FROM chapter_ids), 'MODUŁ 10 — Konserwacja drukarki', '7 lekcji | ~2,5 godz', 10),
      ((SELECT ch11 FROM chapter_ids), 'MODUŁ 11 — Zaawansowana kalibracja i fine-tuning', '6 lekcji | ~3 godz', 11),
      ((SELECT ch12 FROM chapter_ids), 'MODUŁ 12 — Rozwiązywanie problemów', '10 lekcji | ~4 godz', 12),
      ((SELECT ch13 FROM chapter_ids), 'MODUŁ 13 — Druk wielokolorowy (poglądowo)', '2 lekcje | ~45 min', 13),
      ((SELECT ch14 FROM chapter_ids), 'MODUŁ 14 — Praktyczne zastosowania druku 3D', '7 lekcji | ~3 godz', 14),
      ((SELECT ch15 FROM chapter_ids), 'MODUŁ 15 — Projekt końcowy i dalszy rozwój', '5 lekcji | ~2,5 godz', 15)
  ) AS v(id, title, description, "order")
  RETURNING id
)
INSERT INTO "Lesson" (id, "chapterId", title, description, "order", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "chapterId", title, description, "order", NOW(), NOW()
FROM (
  -- MODULE 0
  SELECT (SELECT ch0 FROM chapter_ids) AS "chapterId", '0.1 Witaj w kursie!' AS title, 'Jak kurs jest zorganizowany, czego się nauczysz. Przegląd platformy: lekcje, quizy, wyzwania, forum, prywatne wiadomości.' AS description, 1 AS "order"
  UNION ALL SELECT (SELECT ch0 FROM chapter_ids), '0.2 Co jest w zestawie i co będziesz drukować', 'Zawartość zestawu: A1 Mini + PLA 1 kg + PETG 1 kg. Wymagania sprzętowe: komputer i smartfon. Galeria przykładowych wydruków z kursu.', 2
  UNION ALL SELECT (SELECT ch0 FROM chapter_ids), '0.3 Konto Bambu Lab i aplikacje', 'Rejestracja konta, pobieranie Bambu Handy i Bambu Studio. Omówienie do czego służy każde narzędzie.', 3

  -- MODULE 1
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.1 Rozpakowywanie A1 Mini', 'Kolejność otwierania pudełka. Lista kontrolna: taśmy transportowe, blokady osi, folia na ekranie — usuń przed uruchomieniem.', 1
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.2 Montaż ramienia i przygotowanie miejsca', 'Podłączenie ramienia filamentu. Wymagania: stabilna powierzchnia, min. 15°C, brak przeciągów.', 2
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.3 Pierwsze włączenie i konfiguracja', 'Włączanie, wybór języka, połączenie z WiFi. Rejestracja drukarki w koncie Bambu Lab.', 3
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.4 Auto-kalibracja krok po kroku', 'Co drukarka sprawdza: poziomowanie łoża, kalibracja przepływu, kompensacja wibracji. Czas ~10-15 min.', 4
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.5 Załadowanie filamentu PLA', 'Przygotowanie końcówki filamentu, wprowadzenie do podajnika, oczekiwanie na podgrzanie dyszy do ~220°C.', 5
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.6 Wstępne smarowanie osi Z', 'Dlaczego smarowanie od początku przedłuża żywotność. Różnica między smarem a olejem. Aplikacja smaru na śrubę Z.', 6
  UNION ALL SELECT (SELECT ch1 FROM chapter_ids), '1.7 Problemy przy pierwszym uruchomieniu', 'Najczęstsze sytuacje: WiFi nie działa, kalibracja się nie udaje, ekran nie reaguje. Gdzie szukać pomocy.', 7

  -- MODULE 2
  UNION ALL SELECT (SELECT ch2 FROM chapter_ids), '2.1 Drukowanie przez Bambu Handy (smartfon)', 'Wyszukiwanie 3D Benchy na MakerWorld, wybór filamentu PLA, wysłanie jednym przyciskiem, monitorowanie przez kamerę.', 1
  UNION ALL SELECT (SELECT ch2 FROM chapter_ids), '2.2 Instalacja i pierwsze kroki w Bambu Studio', 'Interfejs programu, import drag-and-drop, slicowanie z domyślnym profilem, wysyłanie przez WiFi.', 2
  UNION ALL SELECT (SELECT ch2 FROM chapter_ids), '2.3 Ekran dotykowy drukarki — mapa interfejsu', 'Status wydruku, temperatura dyszy i łoża, zakładka filamentu, sterowanie osiami, stop i wznów.', 3
  UNION ALL SELECT (SELECT ch2 FROM chapter_ids), '2.4 Podgląd wydruku w Bambu Studio — co z niego czytać', 'Warstwy, czas druku, zużycie filamentu w gramach, Layer View, interpretacja kolorów infill/ściany/support.', 4
  UNION ALL SELECT (SELECT ch2 FROM chapter_ids), '2.5 Wyjmowanie wydruku i ocena jakości', 'Schłodź łoże do ~40°C, ugnij płytę — model odpadnie. Jak ocenić jakość pierwszego wydruku.', 5

  -- MODULE 3
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.1 Technologia FDM — jak powstaje wydruk warstwa po warstwie', 'Proces: model 3D → slicer → G-code → druk. Konsekwencje druku warstwowego: wytrzymałość, ślady, podpory.', 1
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.2 Słownik pojęć druku 3D', 'Definicje z animacjami: ekstruzja, retraction, stringing, warping, overhang, bridge, infill, perimeter, z-seam.', 2
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.3 Osie X, Y, Z — jak drukarka się porusza', 'Ruch głowicy (X) i łoża (Y). Naprężenie pasków a jakość. Prędkość vs precyzja.', 3
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.4 Hotend, dysza, ekstruder — jak filament trafia na model', 'Przepływ: szpula → podajnik → PTFE tube → hotend → dysza. Temperatura druku vs temperatura łoża.', 4
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.5 Dysze — rozmiary i materiały', 'Rozmiary: 0.2/0.4/0.6/0.8 mm. Mosiądz (PLA/PETG/TPU) vs hartowana (filamenty z włóknami). Kiedy używać której.', 5
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.6 Płyta robocza — typy, dobór, pielęgnacja', 'Textured PEI vs Smooth PEI. Kiedy stosować klej. Czyszczenie IPA i wodą z detergentem. Czego unikać.', 6
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.7 Temperatura łoża — rola i optymalne wartości', 'Dlaczego łoże jest podgrzewane. PLA ~55-60°C, PETG ~70-80°C. Warping — kiedy i dlaczego.', 7
  UNION ALL SELECT (SELECT ch3 FROM chapter_ids), '3.8 AMS lite — co to jest i kiedy się przydaje', 'Druk wielokolorowy w 4 kolorach, automatyczny podajnik zapasowy. Kiedy warto dokupić.', 8

  -- MODULE 4
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.1 Jak wybierać filament do projektu', 'Framework: zastosowanie → potrzebne właściwości → filament. Tabela porównawcza PLA vs PETG vs TPU vs ASA.', 1
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.2 PLA — filament z którego zaczniesz', 'Temperatura 210-220°C, odkształcanie od ~55-60°C. Przechowywanie z silica gel. Zalety i ograniczenia.', 2
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.3 Warianty PLA — Silk, Matte, Glow, CF', 'Silk (błysk), Matte (mat), Glow (świeci), CF (wzmocniony — wymaga dyszy hartowanej). Ustawienia dla każdego.', 3
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.4 PETG — gdy potrzebujesz czegoś mocniejszego', 'Temperatura 240-250°C, odporność do ~80°C. Zastosowania mechaniczne. Przechowywanie — silna higroskopijność.', 4
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.5 TPU — elastyczny filament', 'Gumopodobna faktura, odporność na ścieranie. Etui, uszczelki. Trudności: wolny ekstruder, minimalny retraction.', 5
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.6 Zaawansowane materiały: ASA, ABS, PA', 'ASA (UV), ABS (wytrzymały, trudny), PA/Nylon (mechaniczny). Wyższe temperatury, zamknięta komora.', 6
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.7 Wilgoć — największy wróg filamentu', 'Trzaski, pęcherzyki, stringing z zawilgocenia. Rozpoznanie, suszenie w piekarniku 50-60°C, przechowywanie.', 7
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.8 Profile filamentów w Bambu Studio', 'Wbudowane profile Bambu Lab, marketplace, ręczna konfiguracja dla szpul bez profilu.', 8
  UNION ALL SELECT (SELECT ch4 FROM chapter_ids), '4.9 Tagi RFID w szpulach Bambu Lab', 'Automatyczne rozpoznawanie filamentu. Szpule refill i innych marek — brak RFID, ręczna konfiguracja.', 9

  -- MODULE 5
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.1 Interfejs Bambu Studio — mapa programu', 'Pasek narzędzi, panel obiektu, zakładki Global/Object/Layer, widok 3D, panel stanu. Skróty klawiszowe.', 1
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.2 Import i zarządzanie modelami na płycie', 'STL i 3MF drag-and-drop. Kopiowanie (Ctrl+D), skalowanie, obracanie, Auto-arrange. Zapis projektu jako 3MF.', 2
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.3 Orientacja modelu — jedna z najważniejszych decyzji', 'Płaskie duże powierzchnie na dole. Minimalizacja nawisów. Wytrzymałość zależy od kierunku warstw. Auto-orient.', 3
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.4 Infill — wytrzymałość vs. zużycie materiału', '0-100%. Ozdoby: 10-15%. Standard: 20-30%. Mechaniczne: 50%+. Wzory: Grid, Gyroid, Honeycomb, Lightning.', 4
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.5 Wysokość warstwy (Layer Height) — jakość vs. prędkość', '0.1 mm (wysoka jakość), 0.2 mm (standard), 0.3 mm (szybki). Adaptive layer height w Bambu Studio.', 5
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.6 Podpory (Support) — kiedy i jak je stosować', 'Kiedy potrzebny (nawisy >45-50°). Normal vs Tree Support. Support Painting. Interface layer.', 6
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.7 Prędkość druku — wpływ na jakość', 'Normal, Sport, Ludicrous. Pierwsze warstwy zawsze wolno. Perimetry zewnętrzne wolniej. Infill może iść szybko.', 7
  UNION ALL SELECT (SELECT ch5 FROM chapter_ids), '5.8 Samodzielny dobór ustawień — projekt z PLA', 'Integracja wiedzy modułu: orientacja, infill, layer height, support dla uchwytu na słuchawki lub haczyka.', 8

  -- MODULE 6
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.1 Modifier meshes — różne ustawienia w różnych częściach modelu', 'Jak dodać modifikator i ustawić wyższy infill tylko w miejscu naprężeń lub więcej ścianek przy otworach.', 1
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.2 Ironing — perfekcyjnie gładka górna powierzchnia', 'Dodatkowy przejazd bez ekstruzji wygładza górę. Kiedy włączyć. Wpływ na czas druku (+10-30%).', 2
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.3 Variable Layer Height — jakość tam gdzie potrzeba', 'Adaptive Layer Height: grubsza warstwa na prostych ścianach, cieńsza na detalach. Oszczędność czasu.', 3
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.4 Support Painting — precyzyjna kontrola podpór', 'Paint Support (dodaj) vs Paint Anti-Support (wyklucz). Technika: auto-support + ręczne usunięcie zbędnego.', 4
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.5 Fuzzy Skin — teksturowane powierzchnie', 'Ukrywanie artefaktów warstw, efekt estetyczny. Parametry: gęstość, grubość. Nie działa na górze/dole.', 5
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.6 Cut Tool — dzielenie modeli większych niż płyta', 'Limit A1 Mini: 180×180×180 mm. Cięcie proste i pod kątem. Connector dove-tail. Klejenie po wydruku.', 6
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.7 G-code — co to jest i kiedy go eksportować', 'Podstawowe komendy G1/G28/M104/M140. Eksport do pliku. Modyfikacja start/end G-code.', 7
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.8 Drukowanie z karty SD i przez LAN', 'Druk bez internetu. Wysunięcie karty SD z menu (nie wyrywaj!). Kopiowanie G-code. Tryb LAN.', 8
  UNION ALL SELECT (SELECT ch6 FROM chapter_ids), '6.9 Tworzenie własnego profilu druku — fine-tuning', 'Kopia standardowego profilu. Kalibracja temperatury, flow ratio. Zapis i backup profilu.', 9

  -- MODULE 7
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.1 MakerWorld — oficjalna biblioteka Bambu Lab', 'Kategorie, filtry, profile druku przy modelach. Program punktowy dla twórców. Open in Studio.', 1
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.2 Inne biblioteki: Printables, Thingiverse, Cults3D', 'Jak oceniać jakość: ilość pobrań, zdjęcia, profil druku. Czego uważać przy modelach z zewnątrz.', 2
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.3 Formaty plików 3D — STL, 3MF, OBJ, G-code', 'STL (geometria), 3MF (pełny projekt), OBJ (grafika 3D), G-code (gotowe komendy). Zawsze zapisuj jako 3MF.', 3
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.4 Naprawa uszkodzonych plików STL', 'Non-manifold, odwrócone normalne, otwarte siatki. Meshmixer, Netfabb Online. Kiedy warto naprawiać.', 4
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.5 Zarządzanie własną biblioteką plików', 'Struktura folderów, konwencja nazewnictwa (data-opis-filament.3mf). Backup w chmurze.', 5
  UNION ALL SELECT (SELECT ch7 FROM chapter_ids), '7.6 Drukowanie modeli G-code z MakerWorld', '"Ready to print" i "Staff Pick" — optymalne ustawienia twórcy. Brak edycji parametrów. Jak wysłać na drukarkę.', 6

  -- MODULE 8
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.1 Dlaczego warto projektować samemu', 'Adapter do gniazdka, uchwyt, brakująca nóżka — własne projekty. TinkerCAD (start), Fusion 360, Blender.', 1
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.2 TinkerCAD — pierwsze kroki', 'Interfejs, przeciąganie kształtów na płytę, wymiary, obracanie, grupowanie, odejmowanie (Hole). Pierwszy model.', 2
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.3 Precyzyjne wymiarowanie w TinkerCAD', 'Wpisywanie dokładnych wymiarów w mm. Wyrównywanie (Align). Linijka (Ruler). Projekt do pasowania.', 3
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.4 Tekst i personalizacja w TinkerCAD', 'Tekst 3D wytłoczony (raised) i wgłębiony (recessed). Import SVG. Breloczek z imieniem, tabliczka.', 4
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.5 Tolerancje w druku 3D — dlaczego modele nie pasują', 'Skurcz termiczny. Punkt startowy: +0.2 mm na stronę. Seria testowa otworów M3 od 2.8 do 3.4 mm.', 5
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.6 Projekt: uchwyt na kabel USB-C do biurka', 'Kompletna sesja: pomiar → model w TinkerCAD → STL → Bambu Studio → druk → weryfikacja pasowania.', 6
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.7 Projekt: pojemnik z pokrywką', 'Zamek wciskany (-0.1 do +0.2 mm tolerancja). Wieloczęściowy model. Projektowanie i druk pokrywki.', 7
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.8 Import STL do TinkerCAD — modyfikacja gotowych modeli', 'Wczytaj STL jako niemodyfikowalną bryłę. Dodaj napis, otwór, adapter, mocowanie na zewnątrz.', 8
  UNION ALL SELECT (SELECT ch8 FROM chapter_ids), '8.9 Gdzie iść dalej: Fusion 360 i Blender', 'Kiedy TinkerCAD przestaje wystarczać: zaokrąglenia organiczne, parametryczne, złożone montaże.', 9

  -- MODULE 9
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.1 Usuwanie supportów i oczyszczanie wydruku', 'Kombinerki, skalpel, pęseta, szpilka. Technika: ciągnij wzdłuż styku. Szpachlówka na ślady po supportach.', 1
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.2 Szlifowanie — jak wygładzić wydruk', 'Gradacja 120→220→400→800→1200→2000. Wet sanding na finalnych etapach. Kiedy warto, kiedy nie.', 2
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.3 Primer i malowanie wydruków PLA/PETG', 'Primer 2 warstwy, 30 min schnięcia. Farby akrylowe. Lakier varnish. Kolejność: szlifowanie→primer→farba→lakier.', 3
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.4 Klejenie i łączenie wydruków', 'Cyjanoakrylat (szybki, kruchy). Epoksyd (mocniejszy, czas na ustawienie). Magnesy: tolerancja -0.1 do +0.3 mm.', 4
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.5 Heat-set inserts — trwałe gwinty w wydruku', 'M3: otwór 4.5 mm × głębokość 5.7 mm. Lutownica 200°C, powoli i prosto. Setki cykli demontażu.', 5
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.6 Acetone smoothing (informacyjnie)', 'Tylko ABS i ASA — PLA i PETG są odporne. Para acetonu, pojemnikowa metoda. Wentylacja, brak ognia.', 6
  UNION ALL SELECT (SELECT ch9 FROM chapter_ids), '9.7 Projekt modułu: wydruk od pliku do finalnego produktu', 'Kompletna obróbka: TinkerCAD → Bambu Studio → druk → support → szlifowanie → malowanie lub montaż.', 7

  -- MODULE 10
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.1 Plan konserwacji — co i kiedy robić', 'Po każdym wydruku: czyszczenie płyty. Co 20-30h: sprawdzenie osi. Co 200-300h: smarowanie, głowica, nóż.', 1
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.2 Czyszczenie płyty roboczej — codzienna rutyna', 'Mikrofibra po wydruku. IPA 99% co kilka wydruków. Woda z detergentem gdy IPA nie pomaga. Czego unikać.', 2
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.3 Smarowanie osi X, Y i Z', 'Olej = prowadnice liniowe (X, Z prowadnica). Smar = śruba pociągowa Y i Z. Procedura dla każdej osi.', 3
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.4 Konserwacja głowicy i wycieraczek', 'Czyszczenie ekstrudera, wentylatora hotend, wipers (szczypczyki). Sprawdzenie nozzle buckle i 4 śrub.', 4
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.5 Wymiana noża tnącego w ekstruderze', 'Co 10-15 szpul. Zdjąć osłonę → nacisnąć dźwignię → wykręcić śrubkę → wymienić nóż. Ostrożnie!', 5
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.6 Napinanie pasków X i Y', 'Komunikat "belt loosened" lub layer shift. Procedura napinania. Vibration Compensation Calibration po napięciu.', 6
  UNION ALL SELECT (SELECT ch10 FROM chapter_ids), '10.7 Kalibracje drukarki — kiedy i jak je wykonywać', 'Auto-leveling, Flow Calibration, Vibration Compensation, Bed Tramming. Kiedy uruchamiać każdą.', 7

  -- MODULE 11
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.1 Kalibracja Flow Rate — dokładność wymiarów', 'Single Wall Cube, pomiar suwmiarką grubości ścianki. Wzór korekty flow. Zapis w profilu filamentu.', 1
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.2 Kalibracja temperatury — Temperature Tower', 'Model z blokami w różnych temperaturach. Ocena: mosty, stringing, błysk, adhezja warstw.', 2
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.3 Stringing i retraction — eliminacja nitek', 'Direct drive A1 Mini: 0.5-1.5 mm retraction. Z-hop. Temperatura a stringing. Test "retraction tower".', 3
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.4 Pressure Advance — precyzyjne narożniki', 'PA Tower. Zaokrąglone narożniki lub bulging w rogach. Jak odczytać i ustawić wartość PA.', 4
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.5 Bridging — drukowanie w powietrzu', 'Prędkość (wolniej=lepszy most), temperatura (niżej=szybsze chłodzenie). Bridge Test Cube.', 5
  UNION ALL SELECT (SELECT ch11 FROM chapter_ids), '11.6 Twój profil kalibracyjny — dokumentacja ustawień', 'Zebranie flow, temp druku, temp łoża, retraction, PA w jeden profil. Eksport jako backup.', 6

  -- MODULE 12
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.1 Metodologia debugowania — jak podchodzić do problemów', 'Jedna zmiana naraz. Sekwencja: obserwacja → hipoteza → jedna zmiana → test → ocena. Dokumentacja.', 1
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.2 Filament nie przykleja się do płyty', 'Przyczyny: tłuszcz, bed level, temp łoża, profil filamentu, przeciąg. Procedura: mycie → kalibracja → profil.', 2
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.3 Model odkleił się w połowie druku', 'Mała podstawa, warping PETG, przeciąg. Rozwiązania: Brim w Bambu Studio, wyższe temp łoża, eliminacja przeciągów.', 3
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.4 Wady powierzchni — stringing, blobs, zits, under-extrusion', 'Każda wada: zdjęcie przykładu → diagnoza → parametr do zmiany.', 4
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.5 Przesunięcia warstw (Layer Shift)', 'Zderzenie dyszy, luźny pasek, za wysoka prędkość, obluzowana śruba. Kierunek shift = wskazanie osi.', 5
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.6 Nozzle Clumping — grudki na dyszy', 'Filament owija się na dyszy. Sensor A1 Mini wykrywa i pauzuje. Włączenie: Print Options → Nozzle Clumping.', 6
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.7 Problemy z filamentem: zatkana dysza i urwany filament', 'Cold Pull: ogrzej do 190°C (PLA), chłodź do 90°C, szybko wyciągnij filament z zanieczyszczeniem.', 7
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.8 Nierówna pierwsza warstwa — przyczyny mechaniczne', 'Nozzle buckle niezaczepiony, poluzowane 4 śruby hotend. Procedura: zdjąć dyszę → naprawić → kalibracja.', 8
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.9 Kody błędów HMS — jak czytać i reagować', 'Unikalny kod na ekranie, QR kod do skanowania. Portal wiki kursu: polskie opisy i kroki naprawcze.', 9
  UNION ALL SELECT (SELECT ch12 FROM chapter_ids), '12.10 Hierarchia wsparcia — gdzie szukać pomocy', '1. Wiki kursu 2. Forum kursu 3. Prywatna wiadomość 4. Wiki Bambu Lab 5. Forum Bambu Lab 6. Support ticket.', 10

  -- MODULE 13
  UNION ALL SELECT (SELECT ch13 FROM chapter_ids), '13.1 AMS lite — jak działa druk wielokolorowy', 'Do 4 kolorów jednocześnie, backup filamentu (auto-switch). Galeria przykładów. Kiedy warto dokupić.', 1
  UNION ALL SELECT (SELECT ch13 FROM chapter_ids), '13.2 Przygotowanie modelu wielokolorowego w Bambu Studio', 'Color Painting: Fill Tool (wypełnianie) i Circle Tool (pędzel). Purge tower — jak minimalizować.', 2

  -- MODULE 14
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.1 Dom i organizacja — co warto drukować', 'Organizery, uchwyty na kable, haczyki IKEA, adaptery, brakujące nóżki, klipsy, etykiety, wieszaki.', 1
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.2 Naprawa i części zamienne', 'Jak podejść: zmierz → TinkerCAD → wydrukuj → sprawdź → popraw. PLA vs PETG dla części zamiennych.', 2
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.3 Prototypowanie — jak sprawdzić pomysł', 'Iteracyjny workflow: pomysł → szybki model (grube warstwy) → test → poprawki. PLA do prototypów.', 3
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.4 Gadżety, figurki i dekoracje', 'Orientacja figurek dla najlepszej jakości. Puzzle 3D, tokeny do gier. Skalowanie pobranych modeli.', 4
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.5 Akcesoria dla hobbystów', 'RC (samoloty, auta, drony), modelarstwo kolejowe, fotografia, muzyka. MakerWorld i Printables.', 5
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.6 Zarabianie na druku 3D', 'Etsy, targi, MakerWorld Creator Program, usługi druku. Prawa autorskie: licencja NC vs commercial.', 6
  UNION ALL SELECT (SELECT ch14 FROM chapter_ids), '14.7 Druk 3D w pracy i dla firm', 'Jigs montażowe, housing elektroniki, mock-upy produktów. Argumenty ROI. Certyfikaty food-safe.', 7

  -- MODULE 15
  UNION ALL SELECT (SELECT ch15 FROM chapter_ids), '15.1 Projekt końcowy — brief i wymagania', 'Model zaprojektowany samodzielnie (lub znacząco zmodyfikowany), wydrukowany, z opcjonalną obróbką.', 1
  UNION ALL SELECT (SELECT ch15 FROM chapter_ids), '15.2 Praca nad projektem — sesja warsztatowa', 'Czas na pracę nad własnym projektem. Wskazówki gdy model nie wychodzi jak planowano.', 2
  UNION ALL SELECT (SELECT ch15 FROM chapter_ids), '15.3 Galeria i peer review projektów', 'Galeria projektów kursantów. Peer review: 4 kryteria w skali 1-5 — przydatność, jakość, technika, opis.', 3
  UNION ALL SELECT (SELECT ch15 FROM chapter_ids), '15.4 Co dalej — ekosystem Bambu Lab i możliwości', 'Inne drukarki: P1S, X1C, A1. Akcesoria: AMS lite, suszarka. Bambu Maker Program. Gdzie śledzić nowości.', 4
  UNION ALL SELECT (SELECT ch15 FROM chapter_ids), '15.5 Podsumowanie kursu', '10 zasad dobrego druku 3D. Jak długo masz dostęp. Forum i społeczność kursantów pozostaje aktywna.', 5
) AS lessons("chapterId", title, description, "order");
