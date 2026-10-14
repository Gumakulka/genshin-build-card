<p align="center">
  <img src="build/logo.jpg" width="180" alt="Genshin Build Card">
</p>

# Genshin Build Card

Wpisujesz UID, dostajesz profil gracza z Genshin Impact: awatar, wizytówki, poziomy, Otchłań i postacie z gabloty. Po kliknięciu postaci widać jej statystyki, broń i artefakty. Ten sam kod działa jako strona i jako zwykły program na Windowsa.

Wersja online: https://gumakulka.github.io/genshin-build-card/ – gracza można podać od razu w adresie, np. `?uid=760720445`.

## Co potrafi

- Profil gracza, wizytówki, postacie z gabloty z filtrem, szczegóły postaci: statystyki z paskami względem własnych celów, talenty, broń i artefakty z sumą CV i RV (substaty do RV wybierasz sam) oraz oznaczeniem najsłabszego artefaktu.
- Porównanie dwóch graczy razem ze wspólnymi postaciami, link do wyniku i zapis karty postaci do PNG.
- Pod postacią, bronią i każdym artefaktem rozwijana sekcja „Gdzie zdobyć, koszty i wskazówki”: limity poziomów i wzniesień, koszty EXP i Mory, możliwe statystyki główne slotu, ogólne źródła zdobycia, wskazówki wyliczone z danych gracza i linki do wiki.
- Ulubieni gracze, historia konta („co się zmieniło od ostatniej wizyty”) i tryb offline z ostatnio zapisanymi danymi – wszystko w pamięci przeglądarki.
- Jasny i ciemny motyw oraz polska i angielska wersja.

### Panel mapy (split view)

Po wybraniu postaci (a dla broni i artefaktów po rozwinięciu ich sekcji „Gdzie zdobyć” albo przyciskiem „Pokaż na mapie”) z prawej strony wysuwa się panel z mapą AppSample, która oficjalnie pozwala na osadzanie. Panel **nie zasłania strony**: na szerokich ekranach treść zwęża się płynnie do lewej kolumny, a na wąskich panel wysuwa się od dołu jak szuflada i podnosi stopkę. Przycisk w nagłówku przełącza panel między wąskim a szerokim.

Mapa pokazuje tylko typy znaczników, które mają znaczenie: domeny, bossy, broń lub artefakty w świecie, albo dowolny materiał po wyszukaniu nazwy (np. Cecilia).

### Animacje

Sekcje, karty i chipy wjeżdżają kolejno, liczby w statystykach konta naliczają się od zera, pod kursorem pojawia się delikatne światło, przyciski mają falę po kliknięciu, a w tle dryfują poświaty i iskry. Wszystko wyłącza się samo, gdy system ma włączone „ogranicz ruch”.

## Struktura projektu

```
index.html              strona i kolejność ładowania skryptów
src/
  css/
    base.css            motywy, układ strony, profil, postacie, panele
    components.css      przyciski, filtry, porównanie, sekcje informacyjne, panel mapy
    layout.css          układ split view (dopasowanie strony do panelu mapy)
    effects.css         animacje i efekty
  js/
    data/               teksty PL/EN oraz stałe
    core.js             elementy strony, ustawienia, stan aplikacji
    services/           dane statyczne Enki, zapytania o gracza, tryb offline, historia
    ui/                 profil, listy graczy, postacie, broń i artefakty, porównanie, eksport PNG
    features/           guide.js (gdzie zdobyć), map-dock.js (panel mapy), fx.js (efekty)
    app.js              składanie widoku i start aplikacji (ładowany jako ostatni)
desktop/                program na Windowsa (Electron)
worker/                 Worker na Cloudflare (pośrednik do Enka.Network)
build/                  logo, ikony
.github/workflows/      budowanie pliku .exe
```

Frontend to zwykły HTML, CSS i JavaScript, bez bibliotek i bez budowania. Skrypty są zwykłymi plikami ładowanymi po kolei (kolejność jest w `index.html`) i dzielą wspólną przestrzeń nazw, więc nowy plik trzeba dopisać także w `index.html`.

## Jak to jest zrobione

Enka.Network nie wysyła nagłówków CORS, więc przeglądarka nie może pytać jej bezpośrednio. Pośredniczy w tym mały Worker na Cloudflare (`worker/index.js`): przyjmuje tylko adresy w formacie `/uid/123456789` i odpowiada wyłącznie stronom z listy `ALLOWED_ORIGINS`.

Nazwy postaci, broni i zestawów oraz ikony biorę z danych Enki. Pliki z nazwami są przypięte do jednego commita ich repozytorium i zapamiętywane w przeglądarce, więc nowe postacie pojawią się dopiero po zmianie numeru w `STORE_URL` (`src/js/data/constants.js`).

## Uruchomienie lokalnie

Otwórz folder w VS Code i włącz `index.html` przez Live Server. Port 5500 jest dopuszczony w Workerze. Zwykłe otwarcie pliku z dysku nie zadziała, bo Worker odrzuca zapytania z nieznanych adresów.

## Własny Worker

Wklej `worker/index.js` do nowego Workera w Cloudflare i zmień `ALLOWED_ORIGINS` na adresy swojej strony. Adres Workera wpisz w `WORKER_URL` (`src/js/data/constants.js`) oraz w polityce CSP w `index.html`.

## Wersja na Windowsa

Folder `desktop/` to opakowanie w Electronie. Plik `.exe` buduje GitHub Actions: zakładka Actions, workflow „Build Windows exe”, Run workflow, a gotowy plik jest w artefaktach uruchomienia. Szczegóły są w `desktop/README.md`. Program nie jest podpisany, więc SmartScreen może ostrzegać.

## Znane ograniczenia

- Szczegóły postaci są tylko wtedy, gdy gracz ma publiczną gablotę w grze.
- Panel mapy nie wie, która konkretnie domena daje dany zestaw artefaktów ani jaki dokładnie materiał potrzebuje dana postać lub broń – pokazuje typy znaczników (np. wszystkie domeny, bossy). Konkretny materiał znajdziesz wyszukiwarką w panelu albo przez link do wiki.
- Lista znaczników na stronie pomocy AppSample kończy się na Sumeru; nowsze regiony mogą nie mieć znaczników. Adres ramki jest w polityce CSP w `index.html` (`frame-src`) – trzeba go tam dopisać, jeśli dodasz inne źródło mapy w `src/js/features/map-dock.js`.
- Informacje „gdzie zdobyć” są ogólne (wg rzadkości i typu); dokładne źródło konkretnej broni, postaci lub zestawu artefaktów sprawdzisz przez link do wiki.
- Maksymalne rzuty do RV wpisałem ręcznie (`MAX_ROLLS` w `src/js/data/constants.js`), więc wynik może się trochę różnić od innych kalkulatorów.
- Etykiety „Stygian” i „Maks. przyjaźń” to moja interpretacja pól, których dokumentacja Enki nie opisuje.
- Bonus do talentów z konstelacji (np. „10 (+3)”) pokazuje się tylko wtedy, gdy Enka zwraca odpowiednie pole; jeśli nie, widać poziom bazowy.
- Historia konta i tryb offline działają tylko w przeglądarce, w której były zapisane.

## Licencja

MIT. To projekt fanowski, bez związku z HoYoverse; grafiki z gry należą do ich właścicieli i są ładowane z Enka.Network dopiero w trakcie działania strony. Na logo w `build/` jest znak gry, który też jest własnością HoYoverse.
