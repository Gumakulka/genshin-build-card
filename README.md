# Genshin Build Card

Strona, która po wpisaniu UID gracza pokazuje jego profil z Genshin Impact: awatar, wizytówki, statystyki konta, postacie z gabloty oraz szczegóły każdej postaci (statystyki, broń, artefakty, talenty).

**Działająca wersja:** https://gumakulka.github.io/genshin-build-card/

## Funkcje

- Profil gracza z baner-wizytówką, awatarem i kafelkami (poziom przygód, poziom świata, osiągnięcia, Otchłań, Stygian).
- Szczegóły postaci: statystyki, talenty, konstelacje, broń i pięć artefaktów z substatami.
- Ocena artefaktów: suma CV oraz Roll Value (RV) z wybieranymi substatami.
- Cele statystyk (szansa i obrażenia kryt., regeneracja energii) z paskami postępu.
- Porównanie dwóch graczy.
- Link do wyniku (`?uid=123456789`), lista ostatnio wyszukiwanych graczy i eksport karty postaci do PNG.
- Motyw jasny i ciemny oraz język polski i angielski (zapamiętywane w przeglądarce).

## Jak to działa

1. Strona (HTML, CSS i JavaScript bez bibliotek) działa na GitHub Pages.
2. Dane gracza pobiera przez własny serwer pośredniczący na Cloudflare Workers (`worker/index.js`), który dodaje nagłówki CORS i dopuszcza tylko zapytania z tej strony.
3. Nazwy postaci, broni i artefaktów oraz ikony pochodzą z publicznych danych Enka.Network. Pliki z danymi są przypięte do konkretnego commita, żeby zmiany po stronie autora nie psuły strony.

## Uruchomienie lokalnie

1. Sklonuj repozytorium albo pobierz ZIP.
2. Otwórz folder w VS Code i uruchom `index.html` przez rozszerzenie Live Server (port 5500 jest dopuszczony w Workerze).

## Własny Worker

1. Utwórz Worker w Cloudflare i wklej zawartość `worker/index.js`.
2. Zmień listę `ALLOWED_ORIGINS` na adresy swojej strony.
3. Wpisz adres Workera w stałej `WORKER_URL` w `app.js` oraz w polityce CSP w `index.html`.

## Uwagi

Projekt fanowski, niezwiązany z HoYoverse. Grafiki należą do ich właścicieli i są pobierane w trakcie działania strony, nie są częścią tego repozytorium.
