<p align="center">
  <img src="build/logo.jpg" width="180" alt="Genshin Build Card">
</p>

# Genshin Build Card

Wpisz UID, a zobaczysz profil gracza z Genshin Impact: awatar, wizytówki, poziomy, Otchłań i postacie z gabloty. Po kliknięciu postaci pokażą się jej statystyki, broń i artefakty.

**Wersja online:** https://gumakulka.github.io/genshin-build-card/

UID możesz też podać w adresie, np. `?uid=760720445`. Strona dobrze działa na telefonie.

## Co potrafi

- Pokazuje profil gracza, wizytówki i postacie z gabloty, które można przeszukiwać.
- W szczegółach postaci wyświetla statystyki z paskami względem Twoich celów (CRIT, ER), talenty, broń i artefakty. Dla artefaktów liczy sumę CV i RV oraz oznacza najsłabszy z nich.
- Pod postacią, bronią i artefaktami znajdziesz sekcję „Gdzie zdobyć, koszty i wskazówki”.
- Porównuje dwóch graczy, w tym ich wspólne postacie.
- Zapisuje kartę postaci jako PNG i kopiuje link do wyniku.
- Zapamiętuje ulubionych graczy i ostatnio sprawdzanych, pokazuje, co zmieniło się na koncie od ostatniej wizyty, i działa offline na ostatnio zapisanych danych.
- Pozwala zapisać listę ulubionych do pliku i wczytać ją na innym urządzeniu.
- Zawiera mapę z wyszukiwarką znaczników (np. Cecilia).
- Podpowiada w planie farmienia, które książki do talentów są dziś dostępne w domenach.
- Na telefonie zmienia postać po przesunięciu palcem w lewo lub w prawo.
- Ma jasny i ciemny motyw, wersję polską i angielską oraz efekty po kliknięciu. Efekty wyłączają się, jeśli w systemie włączysz ograniczenie animacji.

## Jak korzystać

1. Wpisz 9-cyfrowy UID gracza i kliknij „Szukaj”.
2. Kliknij postać, żeby zobaczyć jej szczegóły.
3. Menu w prawym górnym rogu otwiera mapę i plan farmienia, przenosi do ulubionych i ostatnio sprawdzanych graczy oraz pozwala zapisać lub wczytać listę ulubionych.

Dane zapisane w przeglądarce (ulubieni, historia, tryb offline) usuniesz w menu pozycją „Wyczyść zapisane dane”.

## Wersja na Windowsa

Program `Genshin Build Card.exe` to ta sama strona w osobnym oknie, bez przeglądarki. Plik buduje GitHub Actions: otwórz zakładkę Actions, wybierz „Build Windows exe”, kliknij „Run workflow” i pobierz plik z wyników uruchomienia. Program nie jest podpisany, więc przy pierwszym uruchomieniu Windows SmartScreen może wyświetlić ostrzeżenie.

## Znane ograniczenia

- Szczegóły postaci są dostępne tylko wtedy, gdy gracz ma w grze publiczną gablotę.
- Mapa nie wie, jakiego materiału potrzebuje Twoja postać, więc znacznik trzeba wyszukać samodzielnie. Baza znaczników kończy się na Sumeru, dlatego nowsze regiony mogą ich nie mieć.
- Plan farmienia pokazuje, które serie książek do talentów są dostępne danego dnia, ale nie przypisuje ich do Twoich postaci. Szczegóły sprawdzisz na wiki, do której prowadzi link w oknie planu.
- Wynik RV może się trochę różnić od innych kalkulatorów, ponieważ maksymalne wartości rzutów wpisałem ręcznie.
- Historia konta i tryb offline działają tylko w tej przeglądarce, w której zostały zapisane.
- Lista znajomych z gry nie jest publicznie dostępna, więc aplikacja nie może jej pokazać.

## Dla programistów

Szczegóły techniczne programu na Windowsa opisuje plik `desktop/README.md`.

## Licencja i źródła

Projekt jest na licencji MIT. To projekt fanowski, niezwiązany z HoYoverse. Grafiki z gry należą do ich właścicieli i są ładowane z Enka.Network oraz Project Amber dopiero podczas działania strony. Logo w katalogu `build/` zawiera znak gry, który również jest własnością HoYoverse.

Czcionki Cinzel i Nunito pochodzą z projektu [Fontsource](https://fontsource.org/) (licencja OFL). Ikony pochodzą z biblioteki [Lucide](https://lucide.dev/) (licencja ISC). Dane graczy dostarcza [Enka.Network](https://enka.network/).
