import { Artikel } from "./artikel.model";

export interface RacunVrstica {
    id: number; // unique identifier for the line item (optional)
    kolicina: number;
    racunId: number;
    artikelId: number;
    artikel?: Artikel;
    
}