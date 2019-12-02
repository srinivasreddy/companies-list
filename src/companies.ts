import { ExportToCsv } from "export-to-csv";
import puppeteer from "puppeteer";

export class Crawler {
    private url: string;
    private waitFor: number;
    private results: string [];

    constructor(url: string) {
        this.url = url;
        this.waitFor = 5000;
        this.results = [];
    }

    public async run() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url: string = this.url;
        const tempUrl: URL = new URL(url);
        let results;
        do {
            await page.goto(url);
            results = await page.evaluate(() => {
                return JSON.parse(document.querySelector("body").innerText);
            });
            console.log(results);
            this.results.push.apply(this.results, results);
        }while (results.results && results.results.length > 0);
        browser.close();

    }

    public async generateCSV() {
        const result = await this.run();
        const options = {
            fieldSeparator: ",",
            showLabels: true,
            showTitle: true,
            title: "fortune-500",
            useBom: true,
            useKeysAsHeaders: true,
            useTextFile: false,
        };
        const csv = new ExportToCsv(options);
        csv.generateCsv(result);
    }
}