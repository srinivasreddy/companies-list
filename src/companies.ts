import ObjectsToCsv from "objects-to-csv";
import puppeteer from "puppeteer";

export interface IItem {
    title?: string;
    url: string;
    rank: string;
    revenues: string;
    revchange: string;
    profits: string;
    prftchange: string;
    assets: string;
    mktval: string;
    rankchange1000: string;
    employees: string;
    rankchange: string;
    name: string;
    sector: string;
    industry: string;
    hqcity: string;
    hqstate: string;
    rankgain: string;
    rankdrop: string;
    newcomer: string;
    profitable: string;
    ceofounder: string;
    ceowoman: string;
    jobgrowth: string;
    global500_y_n: string;
    best_companies_y_n: string;
    worlds_most_admired_companies_y_n: string;
    change_the_world_y_n: string;
    hundred_fastest_growing_companies_y_n: string;
}

export interface ISortableObject {
    description: string;
    importField: string;
    order: string;
    saveIn: string;
    sortable: string;
    title: string;
    type: string;
}

export interface IFilterableObject {
    filterable: string;
    importField: string;
    options: string [] ;
    saveIn: string;
    title: string;
    type: string;
}

export interface IFirstObject {
    filterable: IFilterableObject;
    key: string;
    sortable: ISortableObject [];
}

export interface IFieldsObject {
    key: string;
    value: string;
}

export interface IItemsObject {
    fields: IFieldsObject [];
    permalink: string;
}

export interface ISecondObject {
    key: string;
    items: IItemsObject [];
}

const dikt: Map<number, string> = new Map();
dikt.set(2018, "https://content.fortune.com/wp-json/irving/v1/data/franchise-search-results?list_id=2358051");
dikt.set(2019, "https://content.fortune.com/wp-json/irving/v1/data/franchise-search-results?list_id=2611932");

export class Crawler {
    private url: string;
    private waitFor: number;
    private results: string [];
    private path: string;

    constructor(year: number, path: string, waitFor: number = 5000) {
        if (!dikt.has(year)) {
            throw Error(`Currently there is no url to fetch the data in the year ${year}`);
        }
        this.url = dikt.get(year)!;
        this.path = path;
        this.waitFor = waitFor;
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
            this.results.push.apply(this.results, results);
        }while (results.results && results.results.length > 0);
        browser.close();
        return results;
    }

    public async generateCSVObjectList(): Promise<IItem []> {
        const results: [IFirstObject, ISecondObject] = await this.run();
        const result: ISecondObject = results[1];
        const items: IItemsObject [] = result.items;
        const csvObjectList: IItem [] = [];
        for (const item of items) {
            let csvObject =  {} as any;
            for (const field of item.fields) {
                if (field.key.startsWith("100")) {
                    csvObject.hundred_fastest_growing_companies_y_n = field.value;
                } else {
                    csvObject[field.key] = field.value;
                }
            }
            csvObject.url = item.permalink;
            csvObject = csvObject as IItem;
            console.log(`${JSON.stringify(csvObject, undefined, 2)}`);
            csvObjectList.push(csvObject);
        }
        return csvObjectList;
    }

    public async generateCSVFile() {
        const csvArray: IItem [] =  await this.generateCSVObjectList();
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        for (const csvObject of csvArray) {
            try {
            await page.goto(csvObject.url);
            page.waitFor(this.waitFor);

            const href = await page.evaluate(() => {
                return (document.querySelector("table tbody tr td a") as HTMLAnchorElement).href;
            });
            csvObject.url = href;
            console.log(`name: ${csvObject.name || csvObject.title}, url: ${csvObject.url}`);
        } catch {
            csvObject.url = "";
            console.log(`name: ${csvObject.name || csvObject.title}, url: ${csvObject.url}`);
        }
        }
        const newCsv = new ObjectsToCsv(csvArray);
        await newCsv.toDisk(this.path);
        await browser.close();
    }
}
