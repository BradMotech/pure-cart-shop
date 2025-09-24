import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload, Palette, Edit, Plus } from "lucide-react";

interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  gender: string;
  colors: string[] | null;
  sizes: string[] | null;
  image_url: string | null;
  in_stock: boolean | null;
  is_on_sale: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  email?: string | null;
  products?: any[] | null;
  delivery_phone?: string | null;
  delivery_email?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_province?: string | null;
  delivery_postal_code?: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    selected_color: string | null;
    selected_size: string | null;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  }[];
}

interface Collection {
  id: string;
  title: string;
  description: string;
  image_url: string;
  background_color: string;
  text_color: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    gender: "",
    colors: "",
    sizes: "",
    inStock: true,
    isOnSale: false,
  });
  const [collectionForm, setCollectionForm] = useState({
    title: "",
    description: "",
    background_color: "#ff6b6b",
    text_color: "#ffffff",
    button_text: "Shop Now",
    button_url: "/",
    image_url: "",
    sort_order: 0
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchCollections();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select('*')
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders fetch error:", error);
        toast({
          title: "Error",
          description: `Failed to fetch orders: ${error.message}`,
          variant: "destructive",
        });
      } else {
        setOrders(data || []);
        console.log('orders : ', data)
      }
    } catch (error: any) {
      console.error("Orders fetch exception:", error);
      toast({
        title: "Error",
        description: `Failed to fetch orders: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Collections fetch error:', error);
        toast({
          title: "Error",
          description: `Failed to fetch collections: ${error.message}`,
          variant: "destructive",
        });
      } else {
        setCollections(data || []);
      }
    } catch (error: any) {
      console.error('Collections fetch exception:', error);
      toast({
        title: "Error",
        description: `Failed to fetch collections: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files?.map(async (file) => {
      const fileName = `${Date.now()}-${Math.random()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName);

      return publicUrl;
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload one or more images",
        variant: "destructive",
      });
      return [];
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setSubmitting(true);

  //   try {
  //     let imageUrls: string[] = [];
  //     if (imageFiles.length > 0) {
  //       imageUrls = await uploadImages(imageFiles);
  //       if (imageUrls.length === 0) {
  //         setSubmitting(false);
  //         return;
  //       }
  //     }

  //     const productData = {
  //       name: formData.name,
  //       description: formData.description || null,
  //       price: parseFloat(formData.price),
  //       original_price: formData.originalPrice
  //         ? parseFloat(formData.originalPrice)
  //         : null,
  //       category: formData.category,
  //       gender: formData.gender,
  //       colors: formData.colors
  //         .split(",")
  //         ?.map((c) => c.trim())
  //         .filter((c) => c),
  //       sizes: formData.sizes
  //         .split(",")
  //         ?.map((s) => s.trim())
  //         .filter((s) => s),
  //       image_url: imageUrls[0] || null, // Main image
  //       in_stock: formData.inStock,
  //       is_on_sale: formData.isOnSale,
  //     };

  //     let error;
  //     if (editingProduct) {
  //       // Update existing product
  //       const { error: updateError } = await supabase
  //         .from("products")
  //         .update(productData)
  //         .eq("id", editingProduct.id);
  //       error = updateError;
  //     } else {
  //       // Insert new product
  //       const { error: insertError } = await supabase
  //         .from("products")
  //         .insert([productData]);
  //       error = insertError;
  //     }

  //     if (error) {
  //       toast({
  //         title: "Error",
  //         description: error.message || "Failed to save product",
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Success",
  //         description: editingProduct ? "Product updated successfully!" : "Product added successfully!",
  //       });

  //       // Reset form
  //       setFormData({
  //         name: "",
  //         description: "",
  //         price: "",
  //         originalPrice: "",
  //         category: "",
  //         gender: "",
  //         colors: "",
  //         sizes: "",
  //         inStock: true,
  //         isOnSale: false,
  //       });
  //       setImageFiles([]);
  //       setEditingProduct(null);

  //       // Refresh products
  //       fetchProducts();
  //       fetchOrders();
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await uploadImages(imageFiles);
      if (imageUrls.length === 0) {
        setSubmitting(false);
        return;
      }
    }

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      original_price: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      category: formData.category,
      gender: formData.gender,
      colors: formData.colors
        .split(",")
        ?.map((c) => c.trim())
        .filter((c) => c),
      sizes: formData.sizes
        .split(",")
        ?.map((s) => s.trim())
        .filter((s) => s),
      image_url: imageUrls[0] || null, // main image
      in_stock: formData.inStock,
      is_on_sale: formData.isOnSale,
    };

    let productId: string | null = null;
    let error;

    if (editingProduct) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id)
        .select("id")
        .single();

      productId = editingProduct.id;
      error = updateError;

      // Optional: delete existing product_images and re-insert fresh set
      if (!error) {
        await supabase.from("product_images").delete().eq("product_id", productId);
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([productData])
        .select("id")
        .single();

      productId = data?.id || null;
      error = insertError;
    }

    if (error || !productId) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save product",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Insert all uploaded images into product_images
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url) => ({
        product_id: productId!,
        image_url: url,
      }));

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imagesError) {
        console.error("Product images insert error:", imagesError);
      }
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
      originalPrice: "",
      category: "",
      gender: "",
      colors: "",
      sizes: "",
      inStock: true,
      isOnSale: false,
    });
    setImageFiles([]);
    setEditingProduct(null);

    fetchProducts();
    fetchOrders();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};

  const editProduct = (product: DatabaseProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || "",
      category: product.category,
      gender: product.gender,
      colors: product.colors?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      inStock: product.in_stock ?? true,
      isOnSale: product.is_on_sale ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      gender: "",
      colors: "",
      sizes: "",
      inStock: true,
      isOnSale: false,
    });
    setImageFiles([]);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    }
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const collectionData = {
        title: collectionForm.title,
        description: collectionForm.description,
        background_color: collectionForm.background_color,
        text_color: collectionForm.text_color,
        button_text: collectionForm.button_text,
        button_url: collectionForm.button_url,
        image_url: collectionForm.image_url,
        sort_order: collectionForm.sort_order,
        is_active: true
      };

      let error;
      if (editingCollection) {
        const { error: updateError } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', editingCollection.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('collections')
          .insert([collectionData]);
        error = insertError;
      }

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save collection",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: editingCollection ? "Collection updated successfully!" : "Collection added successfully!",
        });

        setCollectionForm({
          title: "",
          description: "",
          background_color: "#ff6b6b",
          text_color: "#ffffff",
          button_text: "Shop Now",
          button_url: "/",
          image_url: "",
          sort_order: 0
        });
        setEditingCollection(null);
        fetchCollections();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const editCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionForm({
      title: collection.title,
      description: collection.description,
      background_color: collection.background_color,
      text_color: collection.text_color,
      button_text: collection.button_text,
      button_url: collection.button_url,
      image_url: collection.image_url,
      sort_order: collection.sort_order
    });
  };

  const deleteCollection = async (id: string) => {
    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      fetchCollections();
    }
  };

  const toggleCollectionActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('collections')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update collection status",
        variant: "destructive",
      });
    } else {
      fetchCollections();
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading admin panel..." />;
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have admin privileges.</p>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="collections">Carousel</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ZAR)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (ZAR)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shirts">Shirts</SelectItem>
                        <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                        <SelectItem value="Pants">Pants</SelectItem>
                        <SelectItem value="Dresses">Dresses</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Men">Men</SelectItem>
                        <SelectItem value="Women">Women</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors">Colors (comma separated)</Label>
                  <Input
                    id="colors"
                    placeholder="e.g. red, blue, green"
                    value={formData.colors}
                    onChange={(e) =>
                      setFormData({ ...formData, colors: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma separated)</Label>
                  <Input
                    id="sizes"
                    placeholder="e.g. XS, S, M, L, XL"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Product Images (multiple allowed)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setImageFiles(files);
                    }}
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {imageFiles.length} image(s) selected
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) =>
                        setFormData({ ...formData, inStock: e.target.checked })
                      }
                    />
                    <span>In Stock</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) =>
                        setFormData({ ...formData, isOnSale: e.target.checked })
                      }
                    />
                    <span>On Sale</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    {submitting ? (editingProduct ? "Updating..." : "Adding...") : (editingProduct ? "Update Product" : "Add Product")}
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="flex flex-col d:h-[900px]">
            <CardHeader>
              <CardTitle>Existing Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg gap-4"
                  >
                    {/* Product image */}
                    <img
                      src={product.image_url || "/placeholder.png"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />

                    {/* Product details */}
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        R{product.price} • {product.category} • {product.gender}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editProduct(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* <CardHeader>
              <CardTitle>Existing Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        R{product.price} • {product.category} • {product.gender}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent> */}
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="collections" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCollectionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collection-title">Collection Title</Label>
                  <Input
                    id="collection-title"
                    value={collectionForm.title}
                    onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-description">Description</Label>
                  <Textarea
                    id="collection-description"
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={collectionForm.background_color}
                        onChange={(e) => setCollectionForm({ ...collectionForm, background_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={collectionForm.background_color}
                        onChange={(e) => setCollectionForm({ ...collectionForm, background_color: e.target.value })}
                        placeholder="#ff6b6b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={collectionForm.text_color}
                        onChange={(e) => setCollectionForm({ ...collectionForm, text_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={collectionForm.text_color}
                        onChange={(e) => setCollectionForm({ ...collectionForm, text_color: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={collectionForm.image_url}
                    onChange={(e) => setCollectionForm({ ...collectionForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input
                      id="button-text"
                      value={collectionForm.button_text}
                      onChange={(e) => setCollectionForm({ ...collectionForm, button_text: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="button-url">Button URL</Label>
                    <Input
                      id="button-url"
                      value={collectionForm.button_url}
                      onChange={(e) => setCollectionForm({ ...collectionForm, button_url: e.target.value })}
                      placeholder="/"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    value={collectionForm.sort_order}
                    onChange={(e) => setCollectionForm({ ...collectionForm, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {submitting ? (editingCollection ? "Updating..." : "Adding...") : (editingCollection ? "Update Collection" : "Add Collection")}
                  </Button>
                  {editingCollection && (
                    <Button type="button" variant="outline" onClick={() => {
                      setEditingCollection(null);
                      setCollectionForm({
                        title: "",
                        description: "",
                        background_color: "#ff6b6b",
                        text_color: "#ffffff",
                        button_text: "Shop Now",
                        button_url: "/",
                        image_url: "",
                        sort_order: 0
                      });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Collections ({collections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-3 border rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: collection.background_color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{collection.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {collection.button_text} • Order: {collection.sort_order}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            collection.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {collection.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCollectionActive(collection.id, collection.is_active)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Palette className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editCollection(collection)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCollection(collection.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                         <p className="font-medium">{order.email || 'No email'}</p>
                        {order.products && order.products.length > 0 &&
                          order.products.map((item: any, index) => (
                            <>
                            <p key={index} className="font-medium">
                              Item: {item?.product?.name}
                            </p>
                            <p key={index} className="font-medium">
                              Price: R {item?.product?.price}
                            </p>
                            </>
                          ))}
                        <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          {order.profiles?.full_name || 'Unknown'} ({order.profiles?.email || 'No email'})
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R{order.total_amount}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delivery Details */}
                    {(order.delivery_address || order.delivery_city || order.delivery_phone || order.delivery_email) && (
                      <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Details</h4>
                        {order.delivery_email && (
                          <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {order.delivery_email}</p>
                        )}
                        {order.delivery_phone && (
                          <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {order.delivery_phone}</p>
                        )}
                        {order.delivery_address && (
                          <p className="text-sm text-gray-600"><span className="font-medium">Address:</span> {order.delivery_address}</p>
                        )}
                        {(order.delivery_city || order.delivery_province || order.delivery_postal_code) && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {[order.delivery_city, order.delivery_province, order.delivery_postal_code].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Items:</h4>
                      {order?.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <img
                            src={item.products?.image_url || "/placeholder.png"}
                            alt={item.products?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.products?.name}</p>
                            <p className="text-gray-500">
                              Qty: {item.quantity} • R{item.price}
                              {item.selected_color && ` • ${item.selected_color}`}
                              {item.selected_size && ` • ${item.selected_size}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.payment_id && (
                      <p className="text-xs text-gray-500">
                        Payment ID: {order.payment_id}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
    </div>
  );
}
