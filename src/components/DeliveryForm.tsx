import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DeliveryDetails {
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface DeliveryFormProps {
  onDeliveryUpdate: (details: DeliveryDetails) => void;
  initialValues?: Partial<DeliveryDetails>;
}

const southAfricanProvinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];

export const DeliveryForm = ({ onDeliveryUpdate, initialValues }: DeliveryFormProps) => {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    phone: initialValues?.phone || '',
    email: initialValues?.email || '',
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    province: initialValues?.province || '',
    postalCode: initialValues?.postalCode || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string) => {
    // South African phone number validation
    const saPhoneRegex = /^(?:\+27|0)[1-9]\d{8}$/;
    return saPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryDetails.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(deliveryDetails.phone)) {
      newErrors.phone = 'Please enter a valid South African phone number (e.g., 0812345678 or +27812345678)';
    }

    if (!deliveryDetails.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(deliveryDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!deliveryDetails.address) newErrors.address = 'Address is required';
    if (!deliveryDetails.city) newErrors.city = 'City is required';
    if (!deliveryDetails.province) newErrors.province = 'Province is required';
    if (!deliveryDetails.postalCode) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DeliveryDetails, value: string) => {
    const updatedDetails = { ...deliveryDetails, [field]: value };
    setDeliveryDetails(updatedDetails);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // If form is valid, update parent
    if (Object.values(updatedDetails).every(val => val.trim() !== '')) {
      if (validatePhone(updatedDetails.phone) && validateEmail(updatedDetails.email)) {
        onDeliveryUpdate(updatedDetails);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="0812345678 or +27812345678"
              value={deliveryDetails.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={deliveryDetails.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Textarea
            id="address"
            placeholder="123 Main Street, Suburb"
            value={deliveryDetails.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Cape Town"
              value={deliveryDetails.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Province *</Label>
            <Select
              value={deliveryDetails.province}
              onValueChange={(value) => handleInputChange('province', value)}
            >
              <SelectTrigger className={errors.province ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {southAfricanProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              placeholder="8000"
              value={deliveryDetails.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={errors.postalCode ? 'border-destructive' : ''}
            />
            {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};