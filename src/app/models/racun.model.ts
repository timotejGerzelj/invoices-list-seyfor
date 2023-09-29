import { RacunVrstica } from "./line-item.model";
import { Organizacija } from "./organizacija.model";
import { Stranka } from "./stranka.model";

export interface Racun {
    id: number;
    dateOfCreation: string;
    price: number;
    orgId: number;
    Organisation?: Organizacija;
    clientId: number;
  }