# Wersja desktopowa (Windows)

Aplikacja w Electronie, która uruchamia tę samą stronę w osobnym oknie, bez przeglądarki.

## Jak to działa

- Przy starcie aplikacja uruchamia lokalny serwer na `127.0.0.1:5500` i serwuje tylko pliki strony (`index.html`, `app.js`, `guide.js`, `map.js`, `style.css`, `features.css`, `animations.css`) oraz logo i favicon z folderu `build/`.
- Adres `http://127.0.0.1:5500` jest dopuszczony w Workerze na Cloudflare, więc zapytania o gracza działają bez zmian.
- Jeśli port 5500 jest zajęty (np. przez Live Server w VS Code), aplikacja otwiera zamiast tego wersję z GitHub Pages.
- Program pamięta rozmiar okna (plik `window.json` w folderze danych programu).
- Linki zewnętrzne (wiki, pełne mapy) otwierają się w domyślnej przeglądarce. Panel mapy z prawej strony jest osadzony w ramce wewnątrz okna.

## Budowanie pliku .exe

Plik buduje GitHub Actions na maszynie z Windows:

1. Wejdź w zakładkę **Actions** w repozytorium.
2. Wybierz workflow **Build Windows exe** i kliknij **Run workflow**.
3. Po kilku minutach otwórz zakończone uruchomienie i pobierz artefakt `genshin-build-card-windows` (zawiera przenośny plik `.exe`).

Ikona programu pochodzi z `build/icon.ico`, a logo i favicon są kopiowane do programu przez ustawienie `extraResources` w `package.json`.

## Budowanie lokalnie

Wymagany jest Node.js. W folderze projektu uruchom:

```
npm install
npm start
npm run dist
```

`npm start` otwiera aplikację, a `npm run dist` tworzy plik `.exe` w folderze `dist`.

## Uwagi

Plik `.exe` nie jest podpisany certyfikatem, więc Windows SmartScreen może pokazać ostrzeżenie przy pierwszym uruchomieniu.
