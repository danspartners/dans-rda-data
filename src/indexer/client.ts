import path from 'path'
import * as es7 from 'es7'
import { MappingTypeMapping } from 'es7/api/types'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../.env') })

console.log(process.env.NODE_ENV)

/**
 * Creates an index if it doesn't exist yet
 */
export async function initIndex(index: string, mappings?: MappingTypeMapping ) {
	const indexExists = await esClient.indices.exists({ index })
	if (indexExists.body) return

	try {
		await esClient.indices.create({
			index,
			body: { mappings }
		})
		console.log(`Index "${index}" initialised`)
	} catch (err) {
		console.log('[ERROR] initIndex', err)
	}
}

let esClient = new es7.Client({
	node: 'http://localhost:9200',
})

if (process.env.NODE_ENV === 'demo') {
	console.log('URL', `http://${process.env.DANS_DEMO_ES_URL}:9200`)
	esClient = new es7.Client({
		node: `http://${process.env.DANS_DEMO_ES_URL}:9200`
	})
}

export { esClient }

	// node: 'https://localhost:9200',
	// auth: {
	// 	username: 'elastic',
	// 	password: 'elpass'
	// },
	// tls: {
	// 	ca: fs.readFileSync('./ca.crt'),
	// 	rejectUnauthorized: false
	// }

// const properties: Record<string, es.estypes.MappingProperty> = {
// 	date: { type: "date" },
// 	description: { type: "text", index: false },
// 	img: { type: "keyword" },
// 	path: { type: "keyword" },
// 	text: {
// 		type: "text",
// 		analyzer: "whitespace"
// 	},
// 	title: { type: "text"  }, 
// 	type_level0: { type: "keyword" },
// 	type_level1: { type: "keyword" },
// 	textSuggest: {
// 		type: "completion",
// 		analyzer: "simple",
// 		search_analyzer: "simple",
// 	},

// 	// Entry specific
// 	facsimiles: { type: "keyword" },
// 	manuscript: { type: "keyword" },
// 	manuscriptId: { type: "keyword" },
// 	media: { type: "keyword" },
// 	org: { type: "keyword" },
// 	person: { type: "keyword" },
// 	place: { type: "keyword" },
// 	theme: { type: "keyword" },
// }

// export interface CommonIndexData {
// 	description: string
// 	id: string
// 	img: string
// 	path: string
// 	text: string
// 	title: string
// 	type_level0: string
// 	type_level1: string
// 	textSuggest?: any
// }
// export interface EntryIndexData {
// 	date?: string
// 	facsimiles?: string[]
// 	manuscript?: string
// 	media?: string[]
// 	org?: string[]
// 	person?: string[]
// 	place?: string[]
// 	theme?: string[]
// }
// export type IndexData = CommonIndexData & EntryIndexData

// export async function indexDocument(data: CommonIndexData, entryData?: EntryIndexData) {
// 	if (entryData != null) data = { ...data, ...entryData }
// 	const { id, ...body } = data

// 	if (body.text != null) {
// 		body.text = body.text
// 			.replace(/<.*?>|\)|\(|\[|\]|:|;|\*|\.|,|\?|!|\//g, ' ')
// 			.replace(/‘|’|"|“|”/g, "'")

// 		body.textSuggest = {
// 			input: body.text
// 				.split(' ')
// 				.map(x =>
//  					x.replace('\n', '')
// 					 .replace(/^('|-|\d)*/, '')
// 					 .replace(/('|-|\d)*$/, '')
// 					 .trim()
// 				)
// 				.filter(x => x.length > 0)
// 		}
// 	}

// 	try {
// 		await esClient.index({
// 			index,
// 			body
// 		})
// 	} catch (err) {
// 		console.log('[ERROR] indexDocument', err)
// 	}
// }