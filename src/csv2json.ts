import path from 'path'
import fs from 'fs-extra'
import csv from 'csvtojson'
import { CSV_DIRNAME, JSON_DIRNAME } from './consts'

const csvDir = path.resolve(process.cwd(), CSV_DIRNAME)
const jsonDir = path.resolve(process.cwd(), JSON_DIRNAME)

async function run() {
    fs.readdirSync(csvDir).forEach(async (file) => {
        const jsonArray = await csv({delimiter: ';'}).fromFile(path.join(csvDir, file));
        fs.writeJsonSync(path.join(jsonDir, file.replace(/csv$/, 'json')), jsonArray, { spaces: 2 })
    })
}

run()
