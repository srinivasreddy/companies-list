import ObjectsToCsv from "objects-to-csv";
import puppeteer from "puppeteer";

interface ISortableObject {
    description: string;
    importField: string;
    order: string;
    saveIn: string;
    sortable: string;
    title: string;
    type: string;
}

interface IFilterableObject {
    filterable: string;
    importField: string;
    options: string [] ;
    saveIn: string;
    title: string;
    type: string;
}

interface IFirstObject {
    filterable: IFilterableObject;
    key: string;
    sortable: ISortableObject [];
}

interface IFieldsObject {
    key: string;
    value: string;
}
interface IItemsObject {
    fields: IFieldsObject [];
    permalink: string;
}

interface ISecondObject {
    key: string;
    items: IItemsObject [];
}

interface ICsvObject {
    companyName: string;
    url: string;
}

export class Crawler {
    private url: string;
    private waitFor: number;
    private results: string [];

    constructor(url: string) {
        this.url = url;
        this.waitFor = 5000;
        this.results = [];
    }

    public async run(): Promise<[IFirstObject, ISecondObject]> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url: string = this.url;
        const tempUrl: URL = new URL(url);
        let results;
        do {
            await page.goto(url);
            results = await page.evaluate(() => {
                return JSON.parse((document.querySelector("body") as HTMLBodyElement).innerText);
            });
            console.log(results);
            this.results.push.apply(this.results, results);
        }while (results.results && results.results.length > 0);
        browser.close();
        return results;
    }

    public async generateCSVObjectList(): Promise<ICsvObject[]> {
        const results: [IFirstObject, ISecondObject] = await this.run();
        const result: ISecondObject = results[1];
        const items: IItemsObject [] = result.items;
        const csvObjectList: ICsvObject [] = [];
        for (const item of items) {
            const field: IFieldsObject = item.fields.find((obj: IFieldsObject) => obj.key === "name")!;
            const permalink: string = item.permalink;
            csvObjectList.push({companyName: field.value, url: permalink});
        }
        return csvObjectList;
    }

    public async generateCSVFile() {
        const newCsvList: ICsvObject [] = [];
        const csvArray: ICsvObject [] =  await this.generateCSVObjectList();
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        for (const csvObject of csvArray) {
            await page.goto(csvObject.url);
            page.waitFor(this.waitFor);
            const url = await page.evaluate(() => {
                return (document.querySelector("table tbody tr td a") as HTMLAnchorElement).href;
            });
            newCsvList.push({companyName: csvObject.companyName, url});
        }
        const csv = new ObjectsToCsv(newCsvList);
        await csv.toDisk("./test.csv");
        await browser.close();
    }
}
