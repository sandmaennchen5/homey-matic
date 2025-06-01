class Logger {
  constructor(homey) {
    this.homey = homey;
    this.lines = [];   // alle Logs (max 50)
    this.errors = [];  // nur Fehler (max 50)
  }

  log(level, ...args) {
    const line = args.join(' ');
    const entry = { level, text: line };

    // Push zur allgemeinen Logliste (50 max)
    if (this.lines.length >= 50) {
      this.lines.shift();
    }
    this.lines.push(entry);

    // Separat Fehler speichern (50 max)
    if (level === 'error') {
      if (this.errors.length >= 50) {
        this.errors.shift();
      }
      this.errors.push(entry);
    }

    // Entwicklerkonsole ausgeben
    this.homey.app.log(`${level.toUpperCase()}: ${line}`);
  }

  getLogLines() {
    return this.lines.map(l => `${l.level.toUpperCase()}: ${l.text}`);
  }

  getErrors() {
    return this.errors.map(l => `ERROR: ${l.text}`);
  }
}

module.exports = Logger