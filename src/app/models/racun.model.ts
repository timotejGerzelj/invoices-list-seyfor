import { RacunVrstica } from "./line-item.model";
import { Organizacija } from "./organizacija.model";

export interface Racun {
    id: number;
    dateOfCreation: string;
    znesek: number;
    orgId: number;
    organizacija?: Organizacija;
    strankaId: number;
    lineItems: RacunVrstica[];
  }