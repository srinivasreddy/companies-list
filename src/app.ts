
import {Crawler} from "./companies";

async function start() {
    const url = "https://content.fortune.com/wp-json/irving/v1/data/franchise-search-results?list_id=2611932";
    const crawler = new Crawler(url);
    await crawler.generateCSV();
}

start();