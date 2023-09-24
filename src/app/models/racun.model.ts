import { RacunVrstica } from "./line-item.model";

export interface Racun {
    id: number;
    dateOfCreation: string;
    znesek: number;
    orgId: number;
    strankaId: number;
    lineItems: RacunVrstica[];
  }