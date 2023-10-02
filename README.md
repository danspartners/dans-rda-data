# RDA data pipeline and API server

# Run containers
Start ES, Kibana, Postgis and Express containers, see [Docker compose file](docker-compose.yml)
- `npm start`

# Pipeline
- put the CSV file into CSV_DIR
- turn CSV into JSON and add to JSON_DIR: `$ npx ts-node src/csv2json.ts`
- add the JSON to PostgreSQL and create a Resource view: `$ npx ts-node src/db`
- index the Resource view in ElasticSearch: `$ npx ts-node src/indexer`
