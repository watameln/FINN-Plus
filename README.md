# FINN+

FINN+ er en modulær Manifest V3-nettleserutvidelse med valgfrie forbedringer av utseende, opprydding og brukervennlighet på FINN.no.

## Last inn lokalt

1. Åpne `chrome://extensions` i Chrome eller en annen Chromium-basert nettleser.
2. Slå på **Utviklermodus**.
3. Velg **Last inn upakket**, og velg denne mappen.
4. Bruk FINN+-knappen i toppmenyen på FINN for å åpne innstillingene uten å forlate siden. Den separate innstillingssiden er også tilgjengelig fra detaljsiden til utvidelsen.

## Automatiske bygg

Hver push og pull request kjører GitHub Actions-arbeidsflyten **Build Chrome extension**. Etter et vellykket bygg opprettes artefakten `finn-plus-chrome-<commit>`, som inneholder den pakkede ZIP-filen for utvidelsen. Arbeidsflyten kan også startes manuelt fra Actions-fanen.

## Arkitektur

- `src/shared/settings.js` inneholder typede standardinnstillinger og synkronisert lagring.
- `src/content/feature-manager.js` styrer livssyklusen til uavhengige funksjoner.
- `src/content/features/` inneholder én separat modul per funksjon som kan slås av og på.
- `src/content/navigation.js` håndterer integrasjonen med FINNs toppmeny.
- `src/content/settings-panel.js` inneholder innstillingspanelet som vises direkte på FINN.
- `settings/` inneholder den separate innstillingssiden for utvidelsen.

Mørk modus bruker FINNs verifiserte, semantiske Warp-designtokens. Funksjonen bruker aldri filtre på hele siden og endrer ikke bilder, videoer, kart eller annet medieinnhold. Fjern KI og Skjul reklame bruker bare kartlagte komponenter og avgrensede observatører, slik at vanlige annonser og søkeresultater ikke påvirkes.
