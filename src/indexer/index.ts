import path from 'path'
import { esClient, initIndex } from './client'

import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { Client } from 'pg'
const client = new Client()

const INDEX_NAME = 'dans-rda2'
const ROWS_PER_PAGE = 100
let page: number = 1

async function selectRows() {
	const result = await client.query(`SELECT * FROM view_resource OFFSET ${(page - 1) * ROWS_PER_PAGE} LIMIT ${ROWS_PER_PAGE};`)

	for (const row of result.rows) {
		try {
			await esClient.index({
				index: INDEX_NAME,
				body: row,
				id: row.uuid_resource
			})
			console.log('[indexed]', row.uuid_resource)
		} catch (err) {
			console.log('[INDEX ERROR]', err)
		}
	}

	if (result.rows.length === ROWS_PER_PAGE) {
		page++
		await selectRows()
	}
}

export async function indexRDA() {
	await initIndex(INDEX_NAME)

	await client.connect()
	await selectRows()
	await client.end()
}

indexRDA()