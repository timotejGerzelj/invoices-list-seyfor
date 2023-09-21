import { RacunVrstica } from "./line-item.model";

export interface Racun {
    id: number;
    dateOfCreation: Date;
    znesek: number;
    orgId: number;
    strankaId: number;
    artikelId: number;
    lineItems: RacunVrstica[];
  }