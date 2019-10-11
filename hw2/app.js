import path from 'path';
import DirWatcher from './modules/dirWatcher.js';
import Importer from './modules/importer.js';

import winston from "winston";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    defaultMeta: { service: 'app' }
});

const watcher = new DirWatcher('dirwatcher');
const importer = new Importer(watcher);
const dest = './data';

importer.watcher.on('changed', (data) => {
    data.map(async (fname) => {
        let fullPath = path.join(dest, fname);
        // async
        let json = await importer.import(fullPath);

        // sync
        // let json = importer.importSync(fullPath);
        logger.info(json);
    })
});

importer.watcher.on('deleted', (data) => {
    data.map(fname => {
        let fullPath = path.join(dest, fname);
        logger.info('deleted file:', {message: fullPath});
    })
});
// kick-off the watch process
watcher.watch(dest, 2000);

