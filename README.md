<p align="center">
  <img src="build/logo.jpg" width="180" alt="Genshin Build Card">
</p>

# Genshin Build Card

Wpisujesz UID, dostajesz profil gracza z Genshin Impact: awatar, wizytówki, poziomy, Otchłań i postacie z gabloty. Po kliknięciu postaci widać jej statystyki, broń i artefakty. Ten sam kod działa jako strona i jako zwykły program na Windowsa.

Wersja online: https://gumakulka.github.io/genshin-build-card/ – gracza można podać od razu w adresie, np. `?uid=760720445`.

## Co potrafi

Poza samym podglądem profilu są też: suma CV i RV artefaktów (substaty do RV wybierasz sam) z oznaczeniem najsłabszego artefaktu, paski postępu dla szansy i obrażeń kryt. oraz regeneracji energii względem własnych celów, porównanie dwóch graczy razem ze wspólnymi postaciami, link do wyniku i zapis karty postaci do PNG.

Pod postacią, bronią i każdym artefaktem jest rozwijana sekcja „Gdzie zdobyć, koszty i wskazówki”: limity poziomów i wzniesień, koszty EXP i Mory, możliwe statystyki główne slotu, ogólne źródła zdobycia, wskazówki wyliczone z danych gracza oraz linki do wiki i dwóch interaktywnych map (HoYoLAB i Teyvat Interactive Map). Kod tych informacji jest w `guide.js`.

Strona pamięta w przeglądarce ostatnio sprawdzane UID, ulubionych graczy i stan konta z poprzednich wizyt (pokazuje, co się zmieniło). Gdy nie ma połączenia, otwiera ostatnio zapisane dane gracza. Jest filtr postaci, jasny i ciemny motyw oraz polska i angielska wersja.

## Jak to jest zrobione

Frontend to zwykły HTML, CSS i JavaScript, bez bibliotek i bez budowania. Enka.Network nie wysyła nagłówków CORS, więc przeglądarka nie może pytać jej bezpośrednio. Pośredniczy w tym mały Worker na Cloudflare (`worker/index.js`): przyjmuje tylko adresy w formacie `/uid/123456789` i odpowiada wyłącznie stronom z listy `ALLOWED_ORIGINS`.

Nazwy postaci, broni i zestawów oraz ikony biorę z danych Enki. Pliki z nazwami są przypięte do jednego commita ich repozytorium i zapamiętywane w przeglądarce, więc nowe postacie pojawią się dopiero po zmianie numeru w `STORE_URL` (`app.js`).

## Uruchomienie lokalnie

Otwórz folder w VS Code i włącz `index.html` przez Live Server. Port 5500 jest dopuszczony w Workerze. Zwykłe otwarcie pliku z dysku nie zadziała, bo Worker odrzuca zapytania z nieznanych adresów.

## Własny Worker

Wklej `worker/index.js` do nowego Workera w Cloudflare i zmień `ALLOWED_ORIGINS` na adresy swojej strony. Adres Workera wpisz w `WORKER_URL` (`app.js`) oraz w polityce CSP w `index.html`.

## Wersja na Windowsa

Folder `desktop/` to opakowanie w Electronie. Plik `.exe` buduje GitHub Actions: zakładka Actions, workflow „Build Windows exe”, Run workflow, a gotowy plik jest w artefaktach uruchomienia. Szczegóły są w `desktop/README.md`. Program nie jest podpisany, więc SmartScreen może ostrzegać.

## Znane ograniczenia

- Szczegóły postaci są tylko wtedy, gdy gracz ma publiczną gablotę w grze.
- Informacje „gdzie zdobyć” są ogólne (wg rzadkości i typu); dokładne źródło konkretnej broni, postaci lub zestawu artefaktów sprawdzisz przez link do wiki. Mapy otwierają się w nowej karcie, nie są osadzone w stronie.
- Maksymalne rzuty do RV wpisałem ręcznie (`MAX_ROLLS` w `app.js`), więc wynik może się trochę różnić od innych kalkulatorów.
- Etykiety „Stygian” i „Maks. przyjaźń” to moja interpretacja pól, których dokumentacja Enki nie opisuje.
- Bonus do talentów z konstelacji (np. „10 (+3)”) pokazuje się tylko wtedy, gdy Enka zwraca odpowiednie pole; jeśli nie, widać poziom bazowy.
- Historia konta i tryb offline działają tylko w przeglądarce, w której były zapisane.

## Licencja

MIT. To projekt fanowski, bez związku z HoYoverse; grafiki z gry należą do ich właścicieli i są ładowane z Enka.Network dopiero w trakcie działania strony. Na logo w `build/` jest znak gry, który też jest własnością HoYoverse.
