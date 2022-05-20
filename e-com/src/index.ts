import { Router } from 'itty-router';

interface Env {
  varName: string
}

type ResultRequest = {
  took: number,
  url: string
  response: object
}

type ResultAllPromisse = {
  took: number,
  url: Array<string>
  response: Array<object>
}

let storeId: string;
let myId: string;
let token: object;
let apiKey: string;

const productId = '5f7fa540b2161709fa3d1c3b';
const baseURLV2 = 'https://ecomplus.io/v2/';
const baseURLV1 = 'https://api.e-com.plus/v1/'

// Create a new router
const router = Router();

const opts = {
  headers: {
    'Content-type': 'application/json',
  },
}


const headerApiV1 = (storeId: string, useToken: boolean) => {
  const header = {
    'Content-type': 'application/json',
    'X-Store-ID': `${storeId}`,
  };
  if (useToken) {
    header['X-Access-Token'] = `${token['access_token']}`
    header['X-My-ID'] = `${myId}`;
  }
  return header;
}

const getToken = async () => {
  console.log('Request token');
  const body = {
    _id: myId,
    api_key: apiKey
  }
  const url = 'https://api.e-com.plus/v1/_authenticate.json';
  const requestConfig = { body: JSON.stringify(body), method: 'POST', headers: headerApiV1(storeId, false) }
  const getToken = fetch(url, requestConfig);
  const request = (await getToken).json();
  return await request;
}

const checkToken = async () => {
  const now = new Date();
  if (!token || (now > new Date(token['expires']))) {
    token = await getToken();
  }
  return (token && token['expires']) ? true : false;
}

router.get('/__token_v1', async () => {
  const isToken = await checkToken();
  return new Response(JSON.stringify({ isToken, expires: token['expires'] }), opts);
});

const request = async (url: string, isV1: boolean, useToken: boolean): Promise<ResultRequest> => {
  const now = new Date().getTime();
  const getProduct = fetch(url, { headers: isV1 ? headerApiV1(storeId, useToken) : {} });
  const request = (await getProduct).json();
  const result = await request;
  const time = (new Date().getTime() - now);
  return {
    took: time,
    url: url,
    response: { ...result }
  }
}

router.get('/favicon.ico', () => {
  return new Response();
})

router.get('/', () => {
  const resources = [
    '/product_v1',
    '/categories_v1',
    '/store_v1',
    '/storeAll_v1',
    '/product_v2',
    '/categories_v2',
    '/store_v2',
    '/storeAll_v2',
  ];
  return new Response(JSON.stringify({ resources }), opts);
});


// Store Api V1
router.get('/product_v1', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const uri = `${baseURLV1}products/${productId}.json`
    const api = await request(uri, true, false);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/categories_v1', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const uri = `${baseURLV1}categories.json`
    const api = await request(uri, true, false);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/store_v1', () => {
  const resp = new Promise<Response>(async (resolve) => {
    await checkToken();
    const uri = `${baseURLV1}stores/me.json`
    const api = await request(uri, true, true);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/storeAll_v1', () => {

  const resp = new Promise<Response>(async (resolve) => {
    await checkToken();
    const urlProduct = `${baseURLV1}products/${productId}.json`
    const urlCategories = `${baseURLV1}categories.json`
    const urlStore = `${baseURLV1}stores/me.json`
    const now = new Date().getTime();
    const result: Array<ResultRequest> = await Promise.all([
      request(urlProduct, true, false),
      request(urlCategories, true, false),
      request(urlStore, true, true)
    ])
    let url: Array<string> = [];
    let response: Array<object> = [];
    const took: number = (new Date().getTime() - now);
    result.forEach(
      (request) => {
        url.push(request.url)
        response.push(request)
      })

    const api: ResultAllPromisse = {
      took,
      url,
      response
    }
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})


// Store Api V2
router.get('/product_v2', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const uri = `${baseURLV2}:${storeId}/products/${productId}`
    const api = await request(uri, false, false);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/categories_v2', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const uri = `${baseURLV2}:${storeId}/categories`
    const api = await request(uri, false, false);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/store_v2', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const uri = `${baseURLV2}:${storeId}/stores/me`
    const api = await request(uri, false, false);
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.get('/storeAll_v2', () => {
  const resp = new Promise<Response>(async (resolve) => {
    const urlProduct = `${baseURLV2}:${storeId}/products/${productId}`
    const urlCategories = `${baseURLV2}:${storeId}/categories`
    const urlStore = `${baseURLV2}:${storeId}/stores/me`
    const now = new Date().getTime();
    const result: Array<ResultRequest> = await Promise.all([
      request(urlProduct, false, false),
      request(urlCategories, false, false),
      request(urlStore, false, false)
    ])
    let url: Array<string> = [];
    let response: Array<object> = [];
    const took: number = (new Date().getTime() - now);
    result.forEach(
      (request) => {
        url.push(request.url)
        response.push(request)
      })

    const api: ResultAllPromisse = {
      took,
      url,
      response
    }
    resolve(new Response(JSON.stringify(api), opts));
  })
  return resp;
})

router.all("*", () => new Response("404, not found!", { status: 404 }))

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    storeId = env['STOREID'];
    apiKey = env['APIKEYV1'];
    myId = env['MYID'];

    return router.handle(request);
  },
};
