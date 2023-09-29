import { Article } from "./article.model";

export interface LineItem {
    id: number; // unique identifier for the line item (optional)
    quantity: number;
    invoiceId: number;
    articleId: number;
    
}
