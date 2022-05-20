# PoC-storeApi 

## Cloudflare Workers
This is my first worker.

## Installing the Workers CLI

https://developers.cloudflare.com/workers/

```npm install wrangler```

## Test local

- Run `npm run serve` 
- Open a browser tab at http://localhost:8787/ to see my worker in action

## Publish Worker

- Run `npm run publish` to publish my worker
- Open a browser tab at https://e-com.wisley.workers.dev/


## Logs

## Routes 


### Store Api V1

1) ```/product_v1```
2) ```/categories_v1```
3) ```/store_v1```
4) ```/storeAll_v1```


###  Store Api V2


1) ```/product_v2```
2) ```/categories_v2```
<!-- 3) ```/store_v2``` -->
<!-- 4) ```/storeAll_v2``` -->

## Reference 
* Learn more at https://developers.cloudflare.com/workers/

* https://developers.cloudflare.com/workers/get-started/guide/

* https://github.com/cloudflare/worker-template-router/blob/master/index.js

* https://egghead.io/lessons/cloudflare-make-api-requests-in-a-workers-function-using-the-fetch-api

* https://github.com/cloudflare/wrangler-action
