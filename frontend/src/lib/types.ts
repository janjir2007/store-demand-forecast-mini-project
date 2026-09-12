export interface Product {
  id: number;
  name: string;
  created_at: string;
}

export interface Sale {
  id: number;
  product_id: number;
  sale_month: string;
  quantity: number;
  unit_price: number | null;
  source_row: number | null;
}

export interface Prediction {
  product_id: number;
  product_name: string;
  forecast_month: string;
  predicted_quantity: number;
  model_name: string;
  observations: number;
}

export interface Token {
  access_token: string;
  token_type: string;
}
