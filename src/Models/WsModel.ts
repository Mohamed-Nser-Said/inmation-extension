export class Identity {
    p?: string;
    i?: number;

    constructor(identifier: string | number) {
        if (typeof identifier === 'number')
            this.i = identifier;
        else
            this.p = identifier;
    }
}

export class Item extends Identity {

}

export class ItemValue extends Item {

    v?: any;
    t?: string;
    q?: number;

    constructor(path:string, value:any, timestamp:any, quality:any) {
        super(path);
        const date = new Date();

        this.v = value;
        this.t = timestamp || date.toISOString();
        this.q = quality || 0;
    }
}

export class HistoricalDataItem extends Item {
    aggregate?: any;

    constructor(identifier:string|number, aggregate:any) {
        super(identifier);
        this.aggregate = aggregate;
    }
}

export class RawHistoricalDataQuery {

    items: any;
    start_time: any;
    end_time: any;
    filter?: any;
    fields?: any;


    constructor(items:any, startTime:any, endTime:any, filter:any, fields:any) {
        let _items = items;
        if (!Array.isArray(items))
            _items = [items];
        this.items = _items;
        this.start_time = startTime;
        this.end_time = endTime;

            this.filter = filter;
 
            this.fields = fields;
    }
}