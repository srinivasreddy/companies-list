import puppeteer from "puppeteer";
import { ExportToCsv } from 'export-to-csv';

class Crawler {
    private url: string;
    private waitFor: number;

    constructor(url: string) {
        this.url = url;
        this.waitFor = 5000;
    }

    public async run() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        console.log(`the url is: ${this.url}`);
        await page.goto(this.url, {waitUntil: "networkidle2"});
        if (this.waitFor) {
            console.log(`the page is waiting until ${this.waitFor} milliseconds.`);
            page.waitFor(this.waitFor);
        }
        const hyperlinks = await page.evaluate((jsonString: string) => {
            const parsedJson = JSON.parse(jsonString);
            const anchors = document.querySelectorAll(parsedJson.querySelect);
            return [].map.call(anchors, (a: any) => {
                return a.href;
            });
        }, JSON.stringify({}));

    }

    public async generate_csv(){
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
        const csv = new ExportToCsv();
    }
};