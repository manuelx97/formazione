# Issue Tracker

This is the boilerplate for the Issue Tracker project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker

## Avvio locale

Richiede MongoDB Server e Node.js 20.19+ oppure 22.12+; verificato con Node 22.

```bash
brew services start mongodb-community@8.0
npm ci --registry=https://registry.npmjs.org
npm run dev
```

Apri **http://localhost:3002**. La pagina **http://localhost:3002/apitest/**
permette di creare, vedere, chiudere ed eliminare le issue del progetto `apitest`.
Ogni altro nome di progetto ha la propria pagina e i propri dati.
I testi delle issue vengono inseriti nella pagina come testo, non HTML.

Nodemon imposta già `PORT=3002` e `NODE_ENV=test`, riavvia l'app alle modifiche
e rende disponibili i risultati dei test a freeCodeCamp. Non serve creare un
`.env` per usare la configurazione locale.

### Database e configurazione

L'app mantiene una connessione MongoDB persistente e usa una sola collezione
`issues`, con un campo interno `project` e un indice per separare i progetti.
Questo campo non viene esposto nelle risposte API né può essere modificato dal
client. I dati rimangono disponibili dopo il riavvio dell'app.

| Variabile | Valore predefinito |
| --- | --- |
| `PORT` | `3002` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/fcc_issue_tracker` |
| `MONGO_TEST_URI` | `mongodb://127.0.0.1:27017/fcc_issue_tracker_test` |
| `NODE_ENV` | `test` con `npm run dev`; altrimenti il valore dell'ambiente |

Puoi inserire questi valori in un `.env` creato manualmente, senza pubblicarlo.
Con Atlas usa una stringa contenente il nome del database. Non configurare
`MONGO_TEST_URI` sul database dell'app: i test devono restare separati.
Il server HTTP viene avviato soltanto dopo una connessione MongoDB riuscita.

## API

Tutti gli endpoint sono sotto `/api/issues/:project`. Sono supportati JSON e
form URL-encoded. Gli errori di validazione previsti dal corso restituiscono
oggetti JSON con stato HTTP 200.

| Metodo | Funzione |
| --- | --- |
| `POST` | Crea una issue; richiede `issue_title`, `issue_text`, `created_by` |
| `GET` | Elenca le issue del progetto e applica i filtri ricevuti |
| `PUT` | Aggiorna i campi inviati per l'`_id` specificato |
| `DELETE` | Elimina l'issue con l'`_id` specificato |

`assigned_to` e `status_text` sono opzionali e hanno valore predefinito `''`.
Il server genera `_id`, `created_on`, `updated_on` e `open: true`.
Le date e il progetto non possono essere sovrascritti da una richiesta.
Gli aggiornamenti vuoti vengono ignorati e `updated_on` avanza a ogni modifica.

Esempi di lettura:

```text
/api/issues/apitest
/api/issues/apitest?created_by=Alice
/api/issues/apitest?created_by=Alice&assigned_to=Bob&open=true
/api/issues/apitest?open=false
/api/issues/apitest?_id=ID_DELL_ISSUE
```

I filtri `_id`, `open` e date vengono convertiti ai tipi MongoDB corrispondenti.
Filtri annidati, operatori MongoDB e campi sconosciuti non vengono usati nelle
query. Un ID appartenente a un altro progetto non può essere letto, aggiornato
o eliminato attraverso il progetto corrente.

## Test

```bash
npm test
```

I **14 test funzionali richiesti** sono in `tests/2_functional-tests.js` e usano
MongoDB reale nel database di test. Ogni esecuzione genera nomi di progetto
univoci e pulisce soltanto i propri documenti, senza cancellare database o dati
inseriti dall'utente. La connessione di test viene chiusa a fine suite.

Con `npm run dev` vengono eseguiti automaticamente anche all'avvio. Il report
per freeCodeCamp è disponibile in `/_api/get-tests`. Importare `server.js` da un
test non avvia un secondo server su una porta fissa.

Sono coperti anche ID malformati/inesistenti, campi mancanti o vuoti, filtri
booleani, tentativi di query annidate e isolamento dei progetti. Gli strumenti
`test-runner.js`, `assertion-analyser.js` e `routes/fcctesting.js` del boilerplate
non sono stati modificati. Mocha 11 mantiene la compatibilità CommonJS del loro
runner; l'aggiornamento automatico a Mocha 12 non è compatibile senza adattarlo.

## Consegna

Con l'app avviata, in un secondo terminale:

```bash
cloudflared tunnel --url http://localhost:3002
```

- **Solution Link:** URL HTTPS generato dal tunnel.
- **Source Code Link:** https://github.com/manuelx97/formazione/tree/main/freecodecamp/quality-assurance/issue-tracker

Il collegamento GitHub sarà disponibile dopo commit e push di questo progetto.
Mantieni attivi MongoDB, app e tunnel durante i test freeCodeCamp.
