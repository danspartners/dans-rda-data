import fs from 'fs-extra'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { Client } from 'pg'
const client = new Client()

import { JSON_DIRNAME } from '../consts'
const jsonDir = path.resolve(process.cwd(), JSON_DIRNAME)

async function main() {
    await client.connect()
    await client.query('BEGIN')

    await client.query(`DROP VIEW IF EXISTS view_resource;`)
    
    for (const file of fs.readdirSync(jsonDir)) {
        const entries = fs.readJsonSync(path.join(jsonDir, file))

        // Turn filename into table name: Resource-Rights.json => resource_rights
        const tableName = file
            .replace(/\.json$/, '')
            .replace(/\s|-/g, '_')
            .toLowerCase()

        // !!!!!!!!!!!!! TMP !!!!!!!!!!!!!!
        // Fix CSV data
        entries.forEach((entry: any) => {
            if (tableName === 'resource') {
                entry.UUID_Resource = entry.UUID_Link
                delete entry.UUID_Link
            }

            if (entry.hasOwnProperty('LOD_PID')) {
                entry[`${tableName}_lod_pid`] = entry.LOD_PID
                delete entry.LOD_PID
            }

            if (entry.hasOwnProperty('type')) {
                entry[`${tableName}_type`] = entry.type
                delete entry.type
            }

            if (entry.hasOwnProperty('Type')) {
                entry[`${tableName}_type`] = entry.Type
                delete entry.Type
            }

            delete entry.relation
        })
        // !!!!!!!!!!!!! TMP !!!!!!!!!!!!!!

        // Get all field names from the first entry,
        // but skip the ones that start with '(' and end with ')'
        const fields = Object.keys(entries[0])
            .filter(key => !/^\(.*\)$/.test(key))

        const createTableSql = `
            CREATE TABLE ${tableName} 
            (${fields.map(field => `${field} TEXT`).join(', ')})
        ;`.trim()

        try {
            await client.query(`DROP TABLE IF EXISTS ${tableName};`)
            await client.query(createTableSql)
        } catch (e) {
            console.log(e)
            await client.query('ROLLBACK')
        }

        for (const entry of entries) {
            const insertEntrySql = `
                INSERT INTO ${tableName}
                (${fields.join(', ')})
                VALUES
                (${fields.map((_, index) => `$${index + 1}`).join(', ')});
            `

            const values = fields

                .map(field => {
                    if (field == 'dc_date' && !/\d\d\d\d-\d\d-\d\d/.test(entry[field])) return null
                    return entry[field]
                })
                .map(value => value?.slice(0, 10) === 'rda_graph:'
                    ? value.slice(10)
                    : value
                )

            try {
                await client.query(insertEntrySql, values)
            } catch (e) {
                console.log(e)
                await client.query('ROLLBACK')
            }
        }
    }

    await client.query(`
        CREATE VIEW view_resource AS
        SELECT 
            *
        FROM resource
            LEFT JOIN (
                SELECT
                    uuid_resource, 
                    array_agg(DISTINCT workflow.workflowstate) as workflows
                FROM workflow, resource_workflow
                WHERE workflow.uuid_workflow = resource_workflow.uuid_adoptionstate
                GROUP BY resource_workflow.uuid_resource
            ) AS workflows USING (uuid_resource)
            LEFT JOIN (
                SELECT
                    uuid_resource, 
                    array_agg(DISTINCT pathway.pathway) as pathways
                FROM pathway, resource_pathway
                WHERE pathway.uuid_pathway = resource_pathway.uuid_pathway
                GROUP BY resource_pathway.uuid_resource
            ) AS pathways USING (uuid_resource)
            LEFT JOIN (
                SELECT
                    individual_resource.uuid_resource,
                    array_agg(DISTINCT individual.combinedname) as individuals
                FROM individual, individual_resource
                WHERE individual.uuid_individual = individual_resource.uuid_individual
                GROUP BY individual_resource.uuid_resource
            ) AS individuals USING (uuid_resource)
            LEFT JOIN (
                SELECT
                    uuid_resource,
                    array_agg(DISTINCT resource_rights.resource_rights_type) as resource_rights_types
                FROM resource_rights
                GROUP BY uuid_resource
            ) AS resource_rights_types USING (uuid_resource)
            LEFT JOIN (
                SELECT
                    uuid_resource,
                    array_agg(DISTINCT resource_relation.relation_type) as relation_types
                FROM resource_relation
                GROUP BY uuid_resource
            ) AS relation_types USING (uuid_resource)
    ;`)

    await client.query('COMMIT')
    await client.end()
}

main()