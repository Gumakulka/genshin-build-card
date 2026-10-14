# Wersja desktopowa (Windows)

Aplikacja w Electronie, która uruchamia tę samą stronę w osobnym oknie, bez przeglądarki.

## Jak to działa

- Przy starcie aplikacja uruchamia lokalny serwer na `127.0.0.1:5500` i serwuje tylko `index.html`, pliki z folderu `src/` (skrypty i style) oraz logo i favicon z folderu `build/`. Wszystko inne, także ścieżki z `..`, dostaje błąd 404. Odpowiedzi mają nagłówki `Cache-Control: no-store` i `X-Content-Type-Options: nosniff`.
- Jeśli port 5500 jest zajęty (np. przez Live Server w VS Code), aplikacja bierze wolny port wybrany przez system i nadal uruchamia lokalną wersję. Wersja z GitHub Pages służy tylko jako ostateczna awaria, gdy lokalny serwer w ogóle nie wystartuje.
- Worker na Cloudflare dopuszcza adresy `http://127.0.0.1:<port>` i `http://localhost:<port>` na dowolnym porcie, więc zapytania o gracza działają także przy porcie innym niż 5500.
- Dane zapisane w przeglądarce (historia kont, tryb offline, język, motyw) są przypisane do adresu z portem. Gdy aplikacja wystartuje na innym porcie niż 5500, nie zobaczy danych zapisanych wcześniej na porcie 5500.
- Program pamięta rozmiar okna (plik `window.json` w folderze danych programu).
- Linki zewnętrzne (wiki, pełne mapy) otwierają się w domyślnej przeglądarce. Panel mapy z prawej strony jest osadzony w ramce wewnątrz okna i przesuwa resztę interfejsu.

## Budowanie pliku .exe

Plik buduje GitHub Actions na maszynie z Windows:

1. Wejdź w zakładkę **Actions** w repozytorium.
2. Wybierz workflow **Build Windows exe** i kliknij **Run workflow**.
3. Po kilku minutach otwórz zakończone uruchomienie i pobierz artefakt `genshin-build-card-windows` (zawiera przenośny plik `.exe`).

Workflow instaluje zależności przez `npm ci` (dokładne wersje z `package-lock.json`) i przed budowaniem uruchamia `npm run check`.

Ikona programu pochodzi z `build/icon.ico`, a logo i favicon są kopiowane do programu przez ustawienie `extraResources` w `package.json`.

## Budowanie lokalnie

Wymagany jest Node.js w wersji 22.12 lub nowszej. W folderze projektu uruchom:

```
npm ci
npm run check
npm start
npm run dist
```

`npm run check` sprawdza składnię plików JS i to, czy pliki wskazane w `index.html` istnieją. `npm start` otwiera aplikację, a `npm run dist` tworzy plik `.exe` w folderze `dist`.

## Uwagi

Plik `.exe` nie jest podpisany certyfikatem, więc Windows SmartScreen może pokazać ostrzeżenie przy pierwszym uruchomieniu.
