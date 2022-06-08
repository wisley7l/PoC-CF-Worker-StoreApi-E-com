// https://developers.cloudflare.com/r2/examples/demo-worker/

interface Env {
  varName: string,
  BUCKET: R2Bucket,
  GCLOUD_STORAGE_BUCKET: string,
}

type ResponseR2 = {
  took: number | null
  page: string | null
  size: number | null
}

const getR2 = async (file: string, env: Env): Promise<ResponseR2> => {
  console.log('get R2: ', file)
  const now = new Date().getTime();
  const request = await env.BUCKET.get(file)
  const result = await request?.text();
  if (result) {
    let response = {
      took: (new Date().getTime() - now),
      page: result,
      size: result.length
    }
    return response
  }
  return {
    took: null,
    page: null,
    size: null
  }

}

const getUrl = async (file: string): Promise<ResponseR2> => {
  console.log('request URL: ', file)
  const url = `https://${file.replace('.html', '')}.com.br/index.html`
  const now = new Date().getTime();
  const getUrl = fetch(url)
  const request = (await getUrl).text();
  const result = await request;
  let response = {
    took: (new Date().getTime() - now),
    page: result,
    size: result.length
  }
  return response;
}

const getGcs = async (file: string): Promise<ResponseR2> => {
  console.log('request URL: ', file)
  const url = `https://storage.googleapis.com/storefront-sp/${file}`
  const now = new Date().getTime();
  const getUrl = fetch(url)
  const request = (await getUrl).text();
  const result = await request;
  let response = {
    took: (new Date().getTime() - now),
    page: result,
    size: result.length
  }
  return response;
}

const getGcsUs = async (file: string): Promise<ResponseR2> => {
  console.log('request URL: ', file)
  // https://storage.googleapis.com/storefront-sp/emporiotiasonia.html
  const url = `https://storage.googleapis.com/storefront-us/${file}`
  const now = new Date().getTime();
  const getUrl = fetch(url)
  const request = (await getUrl).text();
  const result = await request;
  let response = {
    took: (new Date().getTime() - now),
    page: result,
    size: result.length
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const paths = url.pathname.split('/');
    const resource = paths[1];
    const file = paths[2];
    console.log(`\n method: ${request.method} \n resource: ${resource} \n url: ${request.url} \n file: ${file}`)


    let took: number | null;
    let req: string = 'url';
    let page: string | null;
    let response: ResponseR2;

    if (resource === 'r2') {
      let now = new Date().getTime()
      response = await getR2(`${file}`, env);
      took = new Date().getTime() - now;
      page = response.page;
      req = 'r2'
    } else if (resource === 'gcs-sp') {
      let now = new Date().getTime()
      response = await getGcs(file);
      took = new Date().getTime() - now;
      page = response.page;
    } else if (resource === 'gcs-us') {
      let now = new Date().getTime()
      response = await getGcsUs(file);
      took = new Date().getTime() - now;
      page = response.page;
    } else {
      let now = new Date().getTime()
      response = await getUrl(file);
      took = new Date().getTime() - now;
      page = response.page;
    }

    const headers = new Headers()
    headers.set('took', `${response.took}`)
    headers.set('Content-Type', 'text/html; charset=utf-8')
    // headers.set('Content-Type', 'application/json')
    return new Response(response.page, {
      headers,
    })
  },
};
