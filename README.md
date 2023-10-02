# DANS RDA data pipeline

- Graph data is modelled into CSV data. 
- The CSV data is transformed to JSON for easy processing. 
- The JSON documents are inserted into PostgreSQL tables. 
- For every ElasticSearch index a view table is created. At present only the Resource view is defined.
- See a [visual representation](https://docs.google.com/drawings/d/1tkgzZ_CU5A6cxam9k0QRJUQqdh15hkreXlM1xHXZ6oQ/edit?usp=sharing)

## Run containers
Start ES, Kibana, Postgis and Express containers, see [Docker compose file](docker-compose.yml)
- `npm start`

## Pipeline
- copy the CSV files into [CSV_DIR](src/consts.ts#L1)
- turn CSV into JSON and add to [JSON_DIR](src/consts.ts#L2): `$ npx ts-node src/csv2json.ts`
- add the JSON to PostgreSQL and create a Resource view: `$ npx ts-node src/db`
- index the Resource view in ElasticSearch: `$ npx ts-node src/indexer`

## Index remote ES
- `$ NODE_ENV=demo npx ts-node src/indexer`