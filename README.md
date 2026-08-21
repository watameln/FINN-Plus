# FINN+

FINN+ er en modulær Manifest V3-nettleserutvidelse for Chrome/Chromium og Firefox for datamaskiner, med valgfrie forbedringer av utseende, opprydding og brukervennlighet på FINN.no.

## Last inn lokalt

### Chrome og Chromium

1. Åpne `chrome://extensions` i Chrome eller en annen Chromium-basert nettleser.
2. Slå på **Utviklermodus**.
3. Velg **Last inn upakket**, og velg denne mappen.
4. Bruk FINN+-knappen i toppmenyen på FINN eller utvidelsesikonet i nettleseren for å åpne det samme innstillingspanelet.

### Firefox for datamaskiner

1. Åpne `about:debugging#/runtime/this-firefox`.
2. Velg **Last inn midlertidig tillegg**.
3. Velg den pakkede `finn-plus-firefox-*.zip`-filen fra et bygg eller en utgivelse.
4. Bruk FINN+-knappen i toppmenyen på FINN eller utvidelsesikonet i nettleseren for å åpne innstillingspanelet.

Et midlertidig Firefox-tillegg fjernes når Firefox avsluttes. Permanent installasjon krever at pakken signeres av Mozilla, vanligvis ved publisering på [Firefox Add-ons](https://addons.mozilla.org/developers/).

## Automatiske bygg

Hver push og pull request kjører GitHub Actions-arbeidsflyten **Build browser extensions**. Etter et vellykket bygg opprettes to artefakter: `finn-plus-chrome-<commit>` og `finn-plus-firefox-<commit>`. De inneholder samme kildekode, men hver ZIP har manifestet nettleseren forventer. Arbeidsflyten kan også startes manuelt fra Actions-fanen.

Når versjonen i manifestene endres på `main`, oppretter arbeidsflyten **Release browser extensions** automatisk en GitHub-utgivelse med taggen `v<versjon>`, genererte versjonsnotater og separate, versjonerte ZIP-filer for Chrome og Firefox. En eksisterende utgivelse med samme versjon opprettes ikke på nytt. Firefox-pakken må fortsatt sendes til Mozilla for signering før permanent installasjon.

## Arkitektur

- `manifest.json` er Chrome/Chromium-manifestet, mens `manifest.firefox.json` pakkes som Firefox-manifestet.
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
