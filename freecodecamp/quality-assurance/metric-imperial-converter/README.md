# Metric-Imperial Converter

This is the boilerplate for the Metric-Imperial Converter project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/metric-imperial-converter

## Avvio locale

Richiede Node.js e npm. Il progetto è stato verificato con Node.js 22.
Non richiede MongoDB o altri database.

```bash
npm ci --registry=https://registry.npmjs.org
npm run dev
```

Apri **http://localhost:3001**. Nodemon riavvia automaticamente il server quando
modifichi codice, test, HTML o CSS. La configurazione di sviluppo imposta già
`PORT=3001` e `NODE_ENV=test`, quindi non interferisce con la chat sulla porta 3000
e non richiede un `.env` per funzionare.

Se vuoi usare un `.env`, crealo manualmente nella radice del progetto con:

```env
PORT=3001
NODE_ENV=test
```

Il file è escluso da Git. Con `npm start` vengono usati il `.env` o le variabili
d'ambiente; senza configurazione la porta predefinita è comunque 3001, ma i test
automatici all'avvio richiedono `NODE_ENV=test`.

## Test

```bash
npm test
```

Sono presenti **16 test unitari e 5 funzionali**, nelle due suite richieste dal
corso. Il test runner fornito da freeCodeCamp non è stato modificato.
Importare `server.js` dai test non apre una porta fissa e non avvia un secondo
ciclo di test.

Con `npm run dev`, i test vengono eseguiti anche all'avvio e i risultati sono
disponibili agli endpoint usati da freeCodeCamp:

- `/_api/get-tests?type=unit`
- `/_api/get-tests?type=functional`

## Struttura

- `controllers/convertHandler.js`: parsing, validazione, unità, conversioni e frase.
- `routes/api.js`: endpoint `GET /api/convert` e gestione degli input invalidi.
- `tests/1_unit-tests.js`: test del convertitore e dei casi limite numerici.
- `tests/2_functional-tests.js`: verifica HTTP dei cinque casi richiesti.
- `views/index.html`: interfaccia originale del boilerplate.

Il parser separa il numero dall'unità al primo carattere alfabetico. Accetta
interi, decimali e una sola frazione; valida ogni parte senza usare `eval`.
Quando manca il numero usa 1. Frazioni multiple, numeri malformati, divisioni per
zero e risultati non finiti vengono rifiutati.

Le unità sono accettate senza distinzione fra maiuscole e minuscole e restituite
come `gal`, `L`, `mi`, `km`, `lbs` e `kg`. Le conversioni usano i fattori richiesti:

| Conversione | Fattore |
| --- | --- |
| 1 gal → L | 3.78541 |
| 1 lbs → kg | 0.453592 |
| 1 mi → km | 1.60934 |

Le conversioni inverse dividono per lo stesso fattore. Il risultato viene
arrotondato a cinque decimali e restituito come numero, senza zeri finali forzati.

## Esempi API

```text
/api/convert?input=10L
/api/convert?input=1/2km
/api/convert?input=2.5/6lbs
/api/convert?input=kg
```

La risposta per `10L` è:

```json
{
  "initNum": 10,
  "initUnit": "L",
  "returnNum": 2.64172,
  "returnUnit": "gal",
  "string": "10 liters converts to 2.64172 gallons"
}
```

Le conversioni valide sono oggetti JSON. Gli errori sono invece testo semplice
(`text/plain`) con stato HTTP 200, senza virgolette JSON, come richiesto dai test
freeCodeCamp: `invalid unit`, `invalid number`, `invalid number and unit`.

## Invio a freeCodeCamp

Con il server attivo, apri un altro terminale e avvia un tunnel dedicato:

```bash
cloudflared tunnel --url http://localhost:3001
```

Usa l'URL HTTPS stampato dal tunnel come **Solution Link**. Il link funziona solo
finché server e tunnel restano attivi e cambia al riavvio del tunnel.
Il **Source Code Link** dovrà puntare al tuo repository GitHub, non al boilerplate
originale. Il repository remoto non viene creato o pubblicato automaticamente.
