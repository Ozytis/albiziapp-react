export class OsmModel {
    elements: Element[];
}

interface Element {
    type: string;
    name: string;
    elements?: Element[];
    attributes?: any;
}