const fs = require('fs');
const util = require('util');
const postman_transformer = require('postman-collection-transformer');
const transformer = require('api-spec-transformer');
const YAML = require('yamljs')
const DEBUG = require('debug')('verbose')

const postman_convert = util.promisify(postman_transformer.convert);

function getPostmanCollectionVer(data) {
  data = (typeof data === 'string') ? JSON.parse(data) : data;
  let version = '1.0.0'

  if (data.info && data.info.schema && data.info.schema === 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json') {
    version = '2.1.0';
  } else if (data.info && data.info.schema && data.info.schema === 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json') {
    version = '2.0.0'
  }
  return version;
}

async function toPostMan1(data) {
  data = (typeof data === 'string') ? JSON.parse(data) : data;
  const options = {
    inputVersion: getPostmanCollectionVer(data),
    outputVersion: '1.0.0',
    retainIds: true
  };
  let convertedData;

  if (options.inputVersion === '1.0.0') {
    convertedData = data;
  } else {
    try {
      convertedData = await postman_convert(data, options);
    } catch (err) {
      throw err;
    }
  }

  convertedData = (typeof convertedData === 'string') ? convertedData : JSON.stringify(convertedData);
  return convertedData;
}

async function toSwagger(json_postman) {
  json_postman = (typeof json_postman === 'string') ? json_postman : JSON.stringify(json_postman);

  const postmanToSwagger = new transformer.Converter(transformer.Formats.POSTMAN, transformer.Formats.SWAGGER);
  let convertedData;

  try {
    await postmanToSwagger.loadData(json_postman);
    convertedData = await postmanToSwagger.convert('yaml')
  } catch (err) {
    console.error(err);
  } 
  return convertedData;
}

async function convert(fn1, fn2) {
  let data_postman, json_postman1, data_swagger;

  try {
    DEBUG(`1. Read Postman Collection File ${fn1}`);
    const buffer = await fs.promises.readFile(fn1);
    data_postman = JSON.parse(buffer.toString());

    DEBUG(`2. Check Postman Collection Version`);
    const ver = getPostmanCollectionVer(data_postman);

    if (ver !== '1.0.0') {
      DEBUG(`2-1. Postman Collection Version Convertion '${ver}' -> '1.0.0'`);
      json_postman1 = await toPostMan1(data_postman);
    } else {
      json_postman1 = data_postman;
    }

    DEBUG(`3. Postman Colletion Ver1 -> Swagger Yaml`);
    data_swagger = await toSwagger(json_postman1);
    //console.log(data_swagger)

    DEBUG(`4. Save Swagger Yaml File ${fn2}`);
    const json_swagger = JSON.stringify(YAML.parse(data_swagger), undefined, 2);
    await fs.promises.writeFile(fn2, json_swagger, 'utf8');
  }
  catch (err) {
    console.error(err);
  }
}

// main
if (process.argv.length != 3) {
  console.log(`Usage: node ${process.argv[1]} {postman collection filepath}`);
  console.log(`input  : postman collection file path`);
  console.log(`       : postman collection v1, v2, v2.1 supported`);
  console.log(`output : swagger yaml file`);
  console.log(`       : {postman collection file}.yaml`);
  process.exit(1);
}

const output = process.argv[2] + '.yaml';
DEBUG(`Start converting ${process.argv[2]} -> ${output}`);
convert(process.argv[2], output);