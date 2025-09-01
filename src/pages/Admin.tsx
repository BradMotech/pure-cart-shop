import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload, X, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  gender: string;
  colors: string[];
  sizes: string[];
  in_stock: boolean;
  is_on_sale: boolean;
  created_at: string;
  product_images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }>;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: "",
    gender: "",
    colors: "",
    sizes: "",
    in_stock: true,
    is_on_sale: false,
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImages = async (files: File[], productId: string) => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        gender: formData.gender,
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        in_stock: formData.in_stock,
        is_on_sale: formData.is_on_sale,
      };

      let productId: string;

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Upload and save images
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const imageUrls = await uploadImages(selectedFiles, productId);
        
        const imageData = imageUrls.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_primary: index === 0 && !editingProduct, // First image is primary for new products
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageData);

        if (imageError) throw imageError;
      }

      toast({
        title: "Success",
        description: editingProduct ? "Product updated successfully!" : "Product added successfully!",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        category: "",
        gender: "",
        colors: "",
        sizes: "",
        in_stock: true,
        is_on_sale: false,
      });
      setSelectedFiles([]);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category: product.category,
      gender: product.gender,
      colors: product.colors.join(', '),
      sizes: product.sizes.join(', '),
      in_stock: product.in_stock,
      is_on_sale: product.is_on_sale,
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="add-product" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-product">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </TabsTrigger>
            <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
          </TabsList>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
                <CardDescription>
                  {editingProduct ? 'Update product information' : 'Fill in the product details below'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tops">Tops</SelectItem>
                          <SelectItem value="bottoms">Bottoms</SelectItem>
                          <SelectItem value="headwear">Headwear</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unisex">Unisex</SelectItem>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (R)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="original_price">Original Price (R) - Optional</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => handleInputChange('original_price', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="colors">Colors (comma-separated)</Label>
                      <Input
                        id="colors"
                        placeholder="Black, White, Blue"
                        value={formData.colors}
                        onChange={(e) => handleInputChange('colors', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                      <Input
                        id="sizes"
                        placeholder="S, M, L, XL"
                        value={formData.sizes}
                        onChange={(e) => handleInputChange('sizes', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.in_stock}
                        onChange={(e) => handleInputChange('in_stock', e.target.checked)}
                      />
                      <span>In Stock</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_on_sale}
                        onChange={(e) => handleInputChange('is_on_sale', e.target.checked)}
                      />
                      <span>On Sale</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <Label>Product Images</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <div className="mt-4">
                          <label htmlFor="images" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-foreground">
                              Choose images or drag and drop
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              PNG, JPG, GIF up to 10MB each
                            </span>
                          </label>
                          <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading || uploadingImages}>
                      {loading || uploadingImages ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(null);
                          setFormData({
                            name: "",
                            description: "",
                            price: "",
                            original_price: "",
                            category: "",
                            gender: "",
                            colors: "",
                            sizes: "",
                            in_stock: true,
                            is_on_sale: false,
                          });
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-products" className="space-y-6">
            <div className="grid gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {product.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p><strong>Price:</strong> R{product.price}</p>
                        {product.original_price && (
                          <p><strong>Original Price:</strong> R{product.original_price}</p>
                        )}
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Gender:</strong> {product.gender}</p>
                        <div className="flex gap-2 flex-wrap">
                          {product.in_stock ? (
                            <Badge variant="secondary">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {product.is_on_sale && <Badge>On Sale</Badge>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <strong>Colors:</strong>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {product.colors.map((color, index) => (
                              <Badge key={index} variant="outline">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Sizes:</strong>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {product.sizes.map((size, index) => (
                              <Badge key={index} variant="outline">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <strong>Images ({product.product_images.length}):</strong>
                        {product.product_images.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {product.product_images
                              .sort((a, b) => a.sort_order - b.sort_order)
                              .map((image) => (
                              <div key={image.id} className="relative">
                                <img
                                  src={image.image_url}
                                  alt="Product"
                                  className="w-full h-20 object-cover rounded"
                                />
                                {image.is_primary && (
                                  <Badge className="absolute top-1 left-1 text-xs">
                                    Primary
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                                  onClick={() => handleDeleteImage(image.id, product.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            No images
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;