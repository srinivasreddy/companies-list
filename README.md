# Update - 12-12-2019

This project is buggy. Not working, please do not use it. 

I am going to clean up this mess very soon.


# About 

This project extracts Fortune - 1000 companies data from a hidden url of the Fortune website.

# Usage
```typescript
import { Crawler } from "companies-list";
async function start() {
    const crawler = new Crawler(2019, "./srinivas.csv");
    await crawler.generateCSVFile();
}
start();
```
# TODO

1. Implement for any year. Does API support this? And year should be configureable too.
2. Option to implement proxy server(s)
3. csv fields generated should be configurable?
4. Implement persistance to crawl where it left off?
5. Dockerize this application

# License
MIT
