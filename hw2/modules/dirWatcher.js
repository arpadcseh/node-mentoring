import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

import winston from "winston";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    defaultMeta: { service: 'dir-watcher' }
});

class DirWatcher extends EventEmitter{
    constructor(namespace) {
        super(namespace);
        this.namespace = namespace;
        this.path = null;
        this.delay = null;
    }

    watch(dest, delay = 1000) {
        this.delay = delay;
        this.dest = dest;
        this.lastState = fs.readdirSync(dest).map(f => [f, fs.statSync(path.join(this.dest, f))]);
        logger.info('initial state');
        this.emit('changed', this.lastState.map(f => f[0]));
        setInterval(() => {
            let state = fs.readdirSync(dest).map(f => [f, fs.statSync(path.join(this.dest, f))]);
            if (JSON.stringify(this.lastState) !== JSON.stringify(state)) {
                // UPDATE
                let newFiles = state.filter(([f, stat]) => !this.lastState.find(([fn, nStat]) => fn === f));
                let deletedFiles = this.lastState.filter(([f, stat]) => !state.find(([fn, nStat]) => fn === f));
                let changedFiles = this.lastState.filter(([f, stat]) => {
                    let element = state.find(([fn, nState]) => fn === f);
                    return element && stat.mtimeMs !== element[1].mtimeMs;
                })
                if (newFiles.length || deletedFiles.length || changedFiles.length) {
                    logger.info('changed: ', {
                        message: `new: ${newFiles.map(f => f[0])}, deleted: ${deletedFiles.map(f => f[0])}, changed: ${changedFiles.map(f => f[0])}`
                    });
                    this.emit('changed', [...newFiles, ...changedFiles].map(f => f[0]));
                    this.emit('deleted', [...deletedFiles].map(f => f[0]));
                }
                this.lastState = state;
            }
        }, this.delay);
    }
}

export default DirWatcher;