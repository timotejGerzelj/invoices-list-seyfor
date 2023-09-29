import { Artikel } from "./artikel.model";

export interface RacunVrstica {
    id: number; // unique identifier for the line item (optional)
    quantity: number;
    invoiceId: number;
    articleId: number;
    
}
