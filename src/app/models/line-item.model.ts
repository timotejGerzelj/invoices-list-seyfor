export interface LineItem {
    id: number; // unique identifier for the line item (optional)
    itemCode: string;
    itemName: string;
    quantity: number;
    price: number;
    totalValue: number;
  }
  