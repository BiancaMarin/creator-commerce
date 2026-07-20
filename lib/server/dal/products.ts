import "server-only";

export interface Product {
  slug: string;
  name: string;
  tag: string;
  price: number;
  cover: string;
  desc: string;
  files: string;
}

export function getProductsByUser(userId: string): Promise<Product[]> {
  return Promise.resolve([]);
}
