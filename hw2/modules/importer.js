import fs from 'fs'
import csvjson from 'csvjson'

class Importer {
    constructor(watcher) {
        this.watcher = watcher;
    }
    import(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(csvjson.toObject(data));
            });
        });
    }
    importSync (path) {
        return  csvjson.toObject(fs.readFileSync(path, 'utf8'));
    }

}

export default Importer;