<p align="center">
  <img src="build/logo.jpg" width="180" alt="Genshin Build Card">
</p>

# Genshin Build Card

Genshin Build Card to strona, na której wpisujesz UID gracza i od razu widzisz jego profil z Genshin Impact: awatar, wizytówki, poziomy, postęp w Otchłani i postacie z gabloty. Po kliknięciu postaci zobaczysz jej statystyki, broń i artefakty.

**Wypróbuj online:** https://gumakulka.github.io/genshin-build-card/

UID możesz też podać w adresie strony, na przykład `?uid=760720445`. Strona dobrze działa również na telefonie.

## Co potrafi Genshin Build Card

- Pokazuje profil gracza, jego wizytówki i postacie z gabloty, w których można szukać.
- W szczegółach postaci prezentuje statystyki z paskami porównującymi je z Twoimi celami (CRIT, ER), a także talenty, broń i artefakty. Dla artefaktów liczy sumy CV i RV oraz zaznacza najsłabszy z nich.
- Pod postacią, bronią i artefaktami podpowiada, gdzie je zdobyć, ile kosztują i na co zwrócić uwagę.
- Porównuje dwóch graczy, w tym ich wspólne postacie.
- Zapisuje kartę postaci jako obraz PNG i kopiuje link do wyniku.
- Pamięta ulubionych oraz ostatnio sprawdzanych graczy, pokazuje, co zmieniło się na koncie od Twojej ostatniej wizyty, i działa offline na ostatnio zapisanych danych.
- Pozwala zapisać listę ulubionych do pliku i wczytać ją na innym urządzeniu.
- Zawiera mapę z wyszukiwarką znaczników, na przykład Cecilii.
- W planie farmienia pokazuje, które książki do talentów można dziś zdobyć w domenach.
- Na telefonie pozwala zmienić postać przesunięciem palca w lewo lub w prawo.
- Ma jasny i ciemny motyw, wersję polską i angielską oraz drobne efekty po kliknięciu. Efekty znikają, jeśli w systemie włączysz ograniczenie animacji.

## Jak korzystać z Genshin Build Card

1. Wpisz 9-cyfrowy UID gracza i kliknij „Szukaj”.
2. Kliknij wybraną postać, żeby zobaczyć jej szczegóły.
3. Skorzystaj z menu w prawym górnym rogu. Otworzysz w nim mapę i plan farmienia, przejdziesz do ulubionych i ostatnio sprawdzanych graczy oraz zapiszesz lub wczytasz listę ulubionych.

Dane zapisane w przeglądarce (ulubieni gracze, historia i tryb offline) możesz usunąć w menu przyciskiem „Wyczyść zapisane dane”.

## Genshin Build Card na Windowsie

Plik `Genshin Build Card.exe` otwiera tę samą stronę w osobnym oknie, bez przeglądarki. Buduje go GitHub Actions: wejdź w zakładkę Actions, wybierz „Build Windows exe”, kliknij „Run workflow” i pobierz gotowy plik z wyników uruchomienia. Program nie ma podpisu cyfrowego, więc przy pierwszym uruchomieniu Windows SmartScreen może wyświetlić ostrzeżenie.

## Czego Genshin Build Card nie potrafi

- Szczegóły postaci widzisz tylko wtedy, gdy gracz ma w grze publiczną gablotę.
- Mapa nie wie, jakiego materiału potrzebuje Twoja postać, więc znacznik musisz wyszukać samodzielnie. Baza znaczników kończy się na Sumeru, dlatego w nowszych regionach może ich nie być.
- Plan farmienia pokazuje, które książki są dostępne danego dnia, ale nie przypisuje ich do Twoich postaci. Szczegóły znajdziesz na wiki, do której prowadzi link w oknie planu.
- Wynik RV może się trochę różnić od wyników w innych kalkulatorach, ponieważ maksymalne wartości rzutów wpisałem ręcznie.
- Historia konta i tryb offline działają tylko w tej przeglądarce, w której zostały zapisane.
- Lista znajomych z gry nie jest publiczna, więc strona nie może jej pokazać.

## Informacje dla programistów

Szczegóły techniczne wersji na Windowsa znajdziesz w pliku `desktop/README.md`.

## Licencja i źródła

Genshin Build Card jest dostępny na licencji MIT. To projekt fanowski i nie ma żadnego związku z HoYoverse. Grafiki z gry należą do ich właścicieli, a strona pobiera je z Enka.Network i Project Amber dopiero podczas działania. Logo w katalogu `build/` zawiera znak gry, który również jest własnością HoYoverse.

Dane graczy dostarcza [Enka.Network](https://enka.network/). Czcionki Cinzel i Nunito pochodzą z projektu [Fontsource](https://fontsource.org/) (licencja OFL), a ikony z biblioteki [Lucide](https://lucide.dev/) (licencja ISC).
