# OmniRoute Wyvern Setup

Installer CLI per configurare OmniRoute.

## Installazione

```bash
npm install -g omniroute-wyvern-setup
```

## Utilizzo
Esegui il comando:
```bash
omniroute-init
```

## Comportamento dell'Installer (Non Distruttivo)

L'installer è progettato per essere **sicuro** per le tue configurazioni esistenti. Ecco come gestisce i file:

### Cosa viene creato
Se la directory target non esiste, l'installer crea la struttura di base e i file necessari per avviare OmniRoute.

### Cosa NON viene sovrascritto
L'installer verifica la presenza dei file prima di scriverli. Se un file (es. `.env` o `docker-compose.yml`) esiste già, **non verrà toccato**.

| File | Comportamento |
| :--- | :--- |
| `.env` | **Saltato** se esistente (preserva le tue configurazioni). |
| `docker-compose.yml` | **Saltato** se esistente (preserva le tue configurazioni). |

Questo ti permette di mantenere intatte le tue personalizzazioni (API Keys, provider, configurazioni di rete) anche se rilanci lo script di setup.

## Modalità di esecuzione
Lo script ti guiderà nella scelta tra:
1. **Docker:** Utilizzando `docker-compose` (incluso healthcheck automatico).
2. **Nativo:** Installando direttamente il pacchetto npm nel sistema.

## Ottimizzazione (Tuning)
Puoi regolare le prestazioni (compressione e cache) modificando il file `config.json` generato nella cartella di installazione. Il file non viene sovrascritto se rilanci l'installer.
