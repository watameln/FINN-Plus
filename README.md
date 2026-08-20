# FINN+

FINN+ er en modulær Manifest V3-nettleserutvidelse med valgfrie forbedringer av utseende, opprydding og brukervennlighet på FINN.no.

## Last inn lokalt

1. Åpne `chrome://extensions` i Chrome eller en annen Chromium-basert nettleser.
2. Slå på **Utviklermodus**.
3. Velg **Last inn upakket**, og velg denne mappen.
4. Bruk FINN+-knappen i toppmenyen på FINN eller utvidelsesikonet i nettleseren for å åpne det samme innstillingspanelet.

## Automatiske bygg

Hver push og pull request kjører GitHub Actions-arbeidsflyten **Build Chrome extension**. Etter et vellykket bygg opprettes artefakten `finn-plus-chrome-<commit>`, som inneholder den pakkede ZIP-filen for utvidelsen. Arbeidsflyten kan også startes manuelt fra Actions-fanen.

Når versjonen i `manifest.json` endres på `main`, oppretter arbeidsflyten **Release Chrome extension** automatisk en GitHub-utgivelse med taggen `v<versjon>`, genererte versjonsnotater og en versjonert ZIP-fil. En eksisterende utgivelse med samme versjon opprettes ikke på nytt.

## Arkitektur

- `src/shared/settings.js` inneholder typede standardinnstillinger og synkronisert lagring.
- `src/content/feature-manager.js` styrer livssyklusen til uavhengige funksjoner.
- `src/content/features/` inneholder én separat modul per funksjon som kan slås av og på.
- `src/content/navigation.js` håndterer integrasjonen med FINNs toppmeny.
- `src/content/settings-panel.js` inneholder innstillingspanelet som vises direkte på FINN.

Mørk modus bruker FINNs verifiserte, semantiske Warp-designtokens. Funksjonen bruker aldri filtre på hele siden og endrer ikke bilder, videoer, kart eller annet medieinnhold. Fjern KI og Skjul reklame bruker bare kartlagte komponenter og avgrensede observatører, slik at vanlige annonser og søkeresultater ikke påvirkes.

## Lisens

FINN+ er tilgjengelig under [MIT-lisensen](LICENSE).

Les [personvernerklæringen](https://watameln.github.io/FINN-Plus/) for informasjon om hvordan utvidelsen behandler opplysninger.

FINN+ er en uavhengig nettleserutvidelse og er ikke tilknyttet, godkjent eller sponset av FINN.no eller Vend.
