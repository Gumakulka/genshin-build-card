<p align="center">
  <img src="build/logo.jpg" width="180" alt="Genshin Build Card">
</p>

# Genshin Build Card

Wpisujesz UID, dostajesz profil gracza z Genshin Impact: awatar, wizytówki, poziomy, Otchłań i postacie z gabloty. Po kliknięciu postaci widzisz jej statystyki, broń i artefakty.

**Wersja online:** https://gumakulka.github.io/genshin-build-card/

Gracza możesz podać od razu w adresie, np. `?uid=760720445`. Strona działa też wygodnie na telefonie.

## Co potrafi

- Profil gracza, wizytówki i postacie z gabloty z wyszukiwarką.
- Szczegóły postaci: statystyki z paskami względem Twoich celów (CRIT, ER), talenty, broń i artefakty z sumą CV i RV oraz oznaczeniem najsłabszego artefaktu.
- Wskazówki „Gdzie zdobyć, koszty i wskazówki” pod postacią, bronią i artefaktami.
- Porównanie dwóch graczy razem ze wspólnymi postaciami.
- Zapis karty postaci do PNG i kopiowanie linku do wyniku.
- Ulubieni gracze, historia konta (co się zmieniło od ostatniej wizyty) i tryb offline z ostatnio zapisanymi danymi.
- Mapa ze znacznikami z wyszukiwarką (np. Cecilia).
- Plan farmienia: które książki do talentów są dziś dostępne w domenach.
- Na telefonie: przesunięcie palcem w lewo lub w prawo zmienia postać.
- Menu ☰ na górze strony, jasny i ciemny motyw oraz wersja polska i angielska.

## Jak korzystać

1. Wpisz 9-cyfrowy UID gracza i kliknij szukaj.
2. Kliknij postać, żeby zobaczyć jej szczegóły.
3. Menu ☰ otwiera mapę, plan farmienia, listę ulubionych i ostatnio sprawdzanych graczy.

Dane zapisane w przeglądarce (ulubieni gracze, historia, tryb offline) możesz usunąć w menu pozycją „Wyczyść zapisane dane”.

## Wersja na Windowsa

Program `Genshin Build Card.exe` to ta sama strona w osobnym oknie, bez przeglądarki. Plik buduje GitHub: wejdź w zakładkę Actions, wybierz „Build Windows exe”, kliknij Run workflow i pobierz plik z wyników uruchomienia. Program nie jest podpisany, więc Windows SmartScreen może pokazać ostrzeżenie przy pierwszym uruchomieniu.

## Znane ograniczenia

- Szczegóły postaci są tylko wtedy, gdy gracz ma publiczną gablotę w grze.
- Mapa pokazuje typy znaczników i wyszukiwarkę, ale nie wie, jaki dokładnie materiał potrzebuje Twoja postać. Lista znaczników kończy się na Sumeru, więc nowsze regiony mogą nie mieć znaczników.
- Plan farmienia pokazuje serie książek do talentów, ale nie przypisuje ich do Twoich postaci. Do tego służy link do wiki w oknie planu.
- Wynik RV może się trochu różnić od innych kalkulatorów, bo maksymalne rzuty wpisałem ręcznie.
- Historia konta i tryb offline działają tylko w przeglądarce, w której były zapisane.

## Dla programistów

Szczegóły techniczne programu na Windowsa są w `desktop/README.md`.

## Licencja

MIT. To projekt fanowski, bez związku z HoYoverse. Grafiki z gry należą do ich właścicieli i są ładowane z Enka.Network dopiero w trakcie działania strony. Na logo w `build/` jest znak gry, który też jest własnością HoYoverse.
