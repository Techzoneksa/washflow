export interface ServiceRecipe {
  id: string;
  serviceId: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  items: ServiceRecipeItem[];
}

export interface ServiceRecipeItem {
  id: string;
  recipeId: string;
  inventoryItemId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineCost: number;
  currentQuantity: number;
  status: string;
  sortOrder: number;
}

export interface RecipeFormItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  sortOrder: number;
}
