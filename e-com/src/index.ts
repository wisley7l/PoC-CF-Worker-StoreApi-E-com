import { Router } from 'itty-router';

interface Env {
  var_name: string
}

let storeId:string;
let myId:string;
let token: string;

const productId = '5f7fa540b2161709fa3d1c3b';
const baseURLV2 = 'https://ecomplus.io/v2/';
const baseURLV1 = 'https://api.e-com.plus/v1/'

// https://api.e-com.plus/v1/_authenticate.json // gerete token
// Create a new router
const router = Router();

const opts = {
  headers: {
    'Content-type': 'application/json',
  },
}


const headerApiV1 = (storeId: string) => {
  console.log('> ', storeId);
  const header = {
    'Content-type': 'application/json',
    'X-Store-ID': `${storeId}`,
  };

  
  // if(!isToken && token){
  //   // header['X-My-ID'] = `${myId}`
  //   header['X-Access-Token'] = `${token}`

  // }

  return header;
}

router.get('/', () => {
  const resources = ['/product_v1', '/product_v2'];
  return new Response(JSON.stringify({ resources }), opts)
});


router.get('/product_v1', async () => {
  
  const urlV1 = `${baseURLV1}products/${productId}.json`
  const resp = new Promise<Response>(async (resolve) => {
    // request V1
    let nowV1 = new Date().getTime();
    let getProductV1 = fetch(urlV1, { headers: headerApiV1(storeId) });
    const requestV1 = (await getProductV1).json();
    const dataV1 = await requestV1;
    const timeV1 = (new Date().getTime() - nowV1);
    const apiV1 = {
      took: timeV1,
      url: urlV1,
      response: { ...dataV1 }
    }
    resolve(new Response(JSON.stringify(apiV1), opts));
  })
  return resp;
})

router.get('/product_v2', () => {
  console.log('> store', storeId, ' ', productId);
  const urlV2 = `${baseURLV2}:${storeId}/products/${productId}`;
  const resp = new Promise<Response>(async (resolve) => {
    let nowV2 = new Date().getTime();
    let getProductV2 = fetch(urlV2);
    const requestV2 = (await getProductV2).json();
    const dataV2 = await requestV2;
    const timeV2 = (new Date().getTime() - nowV2);
    const apiV2 = {
      took: timeV2,
      url: urlV2,
      response: { ...dataV2 }
    }
    resolve(new Response(JSON.stringify(apiV2), opts));
  })
  return resp;
})


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    storeId = env['STOREID'];
    return router.handle(request);
  },
};
