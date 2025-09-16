-- Create collections table for homepage carousel
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  background_color TEXT DEFAULT '#ff6b6b',
  text_color TEXT DEFAULT '#ffffff',
  button_text TEXT DEFAULT 'Shop Now',
  button_url TEXT DEFAULT '/',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Anyone can view active collections" 
ON public.collections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage collections" 
ON public.collections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample collection data
INSERT INTO public.collections (title, description, image_url, background_color, text_color, button_text, sort_order) VALUES
('WINTER COLLECTION', 'GET AMAZING DISCOUNT ON ALL ITEMS 
IN ALL FASHION BRAND', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop', '#ef4444', '#ffffff', 'SHOP NOW', 1),
('SUMMER SALE', 'UP TO 70% OFF ON SELECTED ITEMS
LIMITED TIME OFFER', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop', '#3b82f6', '#ffffff', 'EXPLORE', 2),
('NEW ARRIVALS', 'DISCOVER THE LATEST FASHION TRENDS
FRESH STYLES EVERY WEEK', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', '#10b981', '#ffffff', 'DISCOVER', 3);