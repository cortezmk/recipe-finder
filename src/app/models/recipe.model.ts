export interface Recipe {
  id: string;
  name: string;
  description: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
  createdAt: string;
}
