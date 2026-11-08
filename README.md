# Formazione

Repository personale di esercizi e progetti di formazione.
Ogni progetto è indipendente e mantiene le proprie dipendenze, configurazione e test.

Git include soltanto questo README, `.gitignore` e la cartella `freecodecamp/`.
Eventuali altri materiali o repository presenti nella cartella locale rimangono
esclusi dalla pubblicazione.

## freeCodeCamp — Quality Assurance

| Progetto | Stato |
| --- | --- |
| [Metric-Imperial Converter](freecodecamp/quality-assurance/metric-imperial-converter/) | Implementato: 16 test unitari e 5 funzionali |
| [Issue Tracker](freecodecamp/quality-assurance/issue-tracker/) | Implementato: 14 test funzionali con MongoDB |
| Personal Library | Da iniziare |
| Sudoku Solver | Da iniziare |
| American British Translator | Da iniziare |

### Avvio del convertitore

```bash
cd freecodecamp/quality-assurance/metric-imperial-converter
npm ci --registry=https://registry.npmjs.org
npm run dev
```

L'app è disponibile su `http://localhost:3001`. `npm run dev` abilita il
riavvio automatico e imposta `NODE_ENV=test` per i controlli freeCodeCamp.

Per eseguire i test:

```bash
npm test
```

### Consegna su freeCodeCamp

- **Source Code Link:** https://github.com/manuelx97/formazione/tree/main/freecodecamp/quality-assurance/metric-imperial-converter
- **Solution Link:** URL pubblico dell'app in esecuzione, non l'indirizzo di questo repository.

Per creare un URL temporaneo, con il server attivo:

```bash
cloudflared tunnel --url http://localhost:3001
```

### Avvio dell'Issue Tracker

```bash
cd freecodecamp/quality-assurance/issue-tracker
npm ci --registry=https://registry.npmjs.org
npm run dev
```

Apri `http://localhost:3002`, oppure `http://localhost:3002/apitest/` per gestire
le issue di un progetto. MongoDB Server deve essere attivo. L'app e i test usano
database locali distinti, senza interferire con gli altri progetti.
Per il tunnel di questo progetto usa `cloudflared tunnel --url http://localhost:3002`.

## Sicurezza

Non includere credenziali, token, password o file `.env` nei commit.
Le dipendenze installate (`node_modules`) e i file di configurazione locali
sono esclusi da Git. La configurazione personale dei commit e dell'accesso a
GitHub è locale a questo repository e non modifica quella aziendale globale.
