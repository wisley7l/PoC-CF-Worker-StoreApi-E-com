import { Router } from 'itty-router';

interface Env {
  varName: string,
  NAMESPACE: KVNamespace
}

type ResponseKV = {
  took: number | null
  page: string | null
  size: number | null
}


const opts = {
  headers: {
    'Content-type': 'application/json',
  },
}

// Create a new router
const router = Router();

let NAMESPACE: KVNamespace;

const getKv = async (file: string, NAMESPACE: KVNamespace): Promise<ResponseKV> => {
  console.log('get KV: ', file)
  const now = new Date().getTime();
  const result = await NAMESPACE.get(file);
  if (result) {
    let response = {
      took: (new Date().getTime() - now),
      page: JSON.parse(result),
      size: result.length
    }
    return response
  }
  return {
    took: null,
    page: `${file} not found`,
    size: null
  }

}

router.get('/favicon.ico', () => {
  return new Response();
})

router.get('/', () => {
  const resources = [
    '/3read',
    '/home.json',
    '/settings.json',
    '/header.json',
    '/footer.json',
  ];
  return new Response(JSON.stringify({ resources }), opts);
});

router.get('/3read', () => {
  if (NAMESPACE) {
    const resp = new Promise<Response>(async (resolve) => {
      let size = 0;
      const now = new Date().getTime();
      const settings = await getKv('settings.json', NAMESPACE);
      const footer = await getKv('footer.json', NAMESPACE);
      const header = await getKv('header.json', NAMESPACE);
      const took = new Date().getTime() - now;
      size += settings.size ? settings.size : 0;
      size += footer.size ? footer.size : 0;
      size += header.size ? header.size : 0;
      const result = {
        took,
        page: {
          settings,
          footer,
          header,
        },
        size,
      }
      resolve(new Response(JSON.stringify(result), opts));
    })
    return resp;
  }
})

router.all("*", async (request) => {
  const url = new URL(request.url)
  const paths = url.pathname.split('/');
  const file = paths[1];
  const api = await getKv(file, NAMESPACE);

  if (api.size) {
    return new Response(JSON.stringify(api), opts);
  }

  return new Response("404, not found!", { status: 404 })
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!NAMESPACE && env['NAMESPACE']) {
      NAMESPACE = env['NAMESPACE'];
    }
    return router.handle(request);
  },
};
