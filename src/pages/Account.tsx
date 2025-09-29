import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Trash2 } from 'lucide-react';
import Header from '@/components/Header';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  email?: string | null;
  products?: any[] | null;
  order_items?: any[] | null;
  delivery_phone?: string | null;
  delivery_email?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_province?: string | null;
  delivery_postal_code?: string | null;
}

export default function Account() {
  const { user, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    console.log('📋 Account fetchProfile - Starting for user:', user.email, user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('📋 Account fetchProfile - Result:', data, 'error:', error);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to fetch profile: ${error.message}`,
        variant: "destructive"
      });
    } else if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    console.log('🛒 Account fetchOrders - Starting for user:', user.email, user.id);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    console.log('🛒 Account fetchOrders - Result:', data, 'error:', error);
    
    if (error) {
      toast({
        title: "Error",
        description: `Failed to fetch orders: ${error.message}`,
        variant: "destructive"
      });
    } else {
      setOrders(data || []);
      console.warn(data)
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      fetchProfile();
    }
    
    setUpdating(false);
  };

  const clearAllOrders = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear orders",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "All orders cleared successfully"
      });
      fetchOrders();
    }
  };

  const clearOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear order",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Order cleared successfully"
      });
      fetchOrders();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">My Account</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <Button onClick={updateProfile} disabled={updating}>
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Recent Orders
                </div>
                {orders?.filter((item)=> item?.order_items?.length > 0)?.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllOrders}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders?.filter((item)=> item?.order_items?.length > 0)?.length === 0 ? (
                <p className="text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders?.filter((item)=> item?.order_items?.length > 0)?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className={`font-medium ${
                            order.status === 'paid' 
                              ? 'text-green-600' 
                              : order.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                          </span>
                        </p>
                        {order.order_items && order.order_items.length > 0 ? (
                          order.order_items.map((item: any, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <img 
                                src={item.product_image || item.products?.image_url || "/placeholder.svg"} 
                                alt={item.product_name || item.products?.name}
                                className="w-8 h-8 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <span>
                                {item.product_name || item.products?.name} (Qty: {item.quantity}) - R{item.price}
                                {item.selected_color && ` • ${item.selected_color}`}
                                {item.selected_size && ` • ${item.selected_size}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No items found</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="font-medium">R{order.total_amount}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => clearOrder(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/wishlist")}
                >
                  View Wishlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/cart")}
                >
                  View Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}