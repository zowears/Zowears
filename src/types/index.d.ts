export interface Design {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  image1: string;
  image2: string;
  stitchCount: number;
  totalColors: number;
  size: string;
  designType: 'Flat' | '3D Puff' | 'Appliqué' | 'Cross Stitch' | 'Satin' | 'Fill Stitch';
  threadType: 'Polyester' | 'Rayon' | 'Metallic' | 'Cotton';
  fabricType: string;
  formats?: string[];
  driveLink: string;
  category: string;
  isFeatured?: boolean;
  status?: 'Active' | 'Draft';
  tags?: string[];
  createdAt?: string;
}
