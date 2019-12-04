
import { Crawler } from "./companies";

async function start() {
    const crawler = new Crawler(2019, "./srinivas.csv");
    await crawler.generateCSVFile();
}
start();

export * from "./companies";