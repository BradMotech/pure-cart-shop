import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Account = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-8">
            You need to be signed in to access your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <p className="text-foreground">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              User ID
            </label>
            <p className="text-foreground text-xs">{user.id}</p>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;