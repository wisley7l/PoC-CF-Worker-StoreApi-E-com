import { Router } from 'itty-router';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Credentials } from 'aws-sdk';
import { Provider } from 'aws-sdk/clients/eks';

interface Env {
  varName: string,
  USERAWS: string,
  ID_ACCESS_KEY_AWS: string,
  SECRET_ACCESS_KEY_AWS: string,
}

const opts = {
  headers: {
    'Content-type': 'application/json',
  },
}


let userAws: string;
let idAcessKeyAws: string;
let secretAcessKeyAws: string;
let region: string = 'sa-east-1';
const table = 'performace-store-api';

const myCredentialProvider = async (): Provider<Credentials> => {
  return {
    // use wrangler secrets to provide these global variables
    accessKeyId: idAcessKeyAws,
    secretAccessKey: secretAcessKeyAws
  }
}

async function dynamoExample() {
  const client = new DynamoDBClient({
    region,
    credentialDefaultProvider: myCredentialProvider
  });
  console.log('> ', client)
  const get = new GetItemCommand({
    TableName: table,
    Key: {
      'api': { S: 'v1' }
    }
  });
  const results = await client.send(get);
  return results.Item;
}


// Create a new router
const router = Router();

router.get('/', async () => {
  console.log('1')
  const resources = [''];
  let t = await dynamoExample();
  // console.log('>', t);
  return new Response('ok', opts);
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    userAws = env['USERAWS'];
    idAcessKeyAws = env['ID_ACCESS_KEY_AWS'];
    secretAcessKeyAws = env['SECRET_ACCESS_KEY_AWS'];

    return router.handle(request);
  },
};
