import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Bell, Shield, CreditCard, MapPin, Save, 
  Wallet, Truck, Package, Building2, Banknote, Plus, Check,
  DollarSign, Globe
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const shippingCarriers = [
  { id: 'usps', name: 'USPS', logo: '📮', description: 'United States Postal Service' },
  { id: 'ups', name: 'UPS', logo: '📦', description: 'United Parcel Service' },
  { id: 'fedex', name: 'FedEx', logo: '🚚', description: 'Federal Express' },
  { id: 'dhl', name: 'DHL', logo: '✈️', description: 'DHL Express' },
  { id: 'amazon', name: 'Amazon Logistics', logo: '📋', description: 'Amazon Delivery' },
  { id: 'ontrac', name: 'OnTrac', logo: '🏃', description: 'Regional Carrier' },
  { id: 'lasership', name: 'LaserShip', logo: '⚡', description: 'Regional Carrier' },
];

const Settings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [newListingAlerts, setNewListingAlerts] = useState(true);
  const [trackingAlerts, setTrackingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  // Payment settings (buyer)
  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
  ]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('card');

  // Payout settings (seller)
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [bankAccountAdded, setBankAccountAdded] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [minimumPayout, setMinimumPayout] = useState('50');

  // Shipping carrier settings
  const [selectedCarriers, setSelectedCarriers] = useState(['usps', 'ups', 'fedex']);
  const [defaultCarrier, setDefaultCarrier] = useState('usps');
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true);
  const [shippingLabelProvider, setShippingLabelProvider] = useState('integrated');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
    }
  }, [user, profile, loading, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      username,
      bio,
      location,
      phone,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated successfully' });
    }
  };

  const toggleCarrier = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden lg:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="payouts" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden lg:inline">Get Paid</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden lg:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger value="seller" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">Seller</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden lg:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information visible to other users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Avatar</Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, State"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab (Buyer) */}
            <TabsContent value="payments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription>Manage how you pay for purchases</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {savedCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded flex items-center justify-center text-xs font-bold">
                            {card.brand}
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• {card.last4}</p>
                            <p className="text-sm text-muted-foreground">Expires {card.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.isDefault && <Badge variant="secondary">Default</Badge>}
                          <Button variant="ghost" size="sm">Remove</Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Card
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Other Payment Options</CardTitle>
                    <CardDescription>Additional ways to pay</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">P</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Apple Pay</p>
                          <p className="text-sm text-muted-foreground">Fast checkout with Apple Pay</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Google Pay</p>
                          <p className="text-sm text-muted-foreground">Quick payment with Google</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                    <CardDescription>Default address for payments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input placeholder="123 Main Street" />
                      </div>
                      <div className="space-y-2">
                        <Label>Apt / Suite</Label>
                        <Input placeholder="Apt 4B" />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input placeholder="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input placeholder="10001" />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select defaultValue="us">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Address
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payouts Tab (Seller) */}
            <TabsContent value="payouts">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Payout Settings
                    </CardTitle>
                    <CardDescription>Configure how you receive payments from sales</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Available Balance</p>
                          <p className="text-3xl font-bold text-primary">$0.00</p>
                        </div>
                        <Button>Withdraw</Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Payout Method</h4>
                      
                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'bank' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('bank')}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Bank Account</p>
                            <p className="text-sm text-muted-foreground">Direct deposit to your bank (2-3 days)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bankAccountAdded ? (
                            <Badge className="bg-success">Connected</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setBankAccountAdded(true); }}>Add</Button>
                          )}
                          {payoutMethod === 'bank' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>

                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'paypal' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('paypal')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">Instant transfer to PayPal (fees apply)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {paypalEmail ? (
                            <Badge className="bg-success">Connected</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setPaypalEmail('user@email.com'); }}>Connect</Button>
                          )}
                          {payoutMethod === 'paypal' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>

                      <div 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${payoutMethod === 'debit' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setPayoutMethod('debit')}
                      >
                        <div className="flex items-center gap-3">
                          <Banknote className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Instant to Debit Card</p>
                            <p className="text-sm text-muted-foreground">Get paid in minutes (1.5% fee)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Add Card</Button>
                          {payoutMethod === 'debit' && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Payout Schedule</h4>
                      <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly (Every Monday)</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Minimum Payout Amount</h4>
                      <Select value={minimumPayout} onValueChange={setMinimumPayout}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No minimum</SelectItem>
                          <SelectItem value="25">$25</SelectItem>
                          <SelectItem value="50">$50</SelectItem>
                          <SelectItem value="100">$100</SelectItem>
                          <SelectItem value="250">$250</SelectItem>
                          <SelectItem value="500">$500</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">Payouts will only be made when your balance exceeds this amount</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Information</CardTitle>
                    <CardDescription>Required for sellers earning over $600/year</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">W-9 Form</p>
                        <p className="text-sm text-muted-foreground">Tax identification for US sellers</p>
                      </div>
                      <Button variant="outline" size="sm">Submit</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">1099-K Forms</p>
                        <p className="text-sm text-muted-foreground">View your annual tax documents</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Carriers
                    </CardTitle>
                    <CardDescription>Select which carriers you use for shipping packages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shippingCarriers.map((carrier) => (
                      <div 
                        key={carrier.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCarriers.includes(carrier.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleCarrier(carrier.id)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{carrier.logo}</span>
                          <div>
                            <p className="font-medium">{carrier.name}</p>
                            <p className="text-sm text-muted-foreground">{carrier.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedCarriers.includes(carrier.id) && defaultCarrier === carrier.id && (
                            <Badge>Default</Badge>
                          )}
                          <Checkbox 
                            checked={selectedCarriers.includes(carrier.id)}
                            onCheckedChange={() => toggleCarrier(carrier.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default Carrier</CardTitle>
                    <CardDescription>Choose your preferred carrier for new shipments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={defaultCarrier} onValueChange={setDefaultCarrier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingCarriers.filter(c => selectedCarriers.includes(c.id)).map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            <span className="flex items-center gap-2">
                              <span>{carrier.logo}</span>
                              {carrier.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Package Tracking
                    </CardTitle>
                    <CardDescription>Configure how you track shipments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatic Tracking Updates</p>
                        <p className="text-sm text-muted-foreground">Receive real-time tracking notifications</p>
                      </div>
                      <Switch checked={autoTrackingEnabled} onCheckedChange={setAutoTrackingEnabled} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Send Tracking to Buyers</p>
                        <p className="text-sm text-muted-foreground">Automatically email tracking info to buyers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delivery Confirmation</p>
                        <p className="text-sm text-muted-foreground">Get notified when packages are delivered</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Labels</CardTitle>
                    <CardDescription>How you create and print shipping labels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={shippingLabelProvider} onValueChange={setShippingLabelProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Use MarketPlace Labels (Discounted rates)</SelectItem>
                        <SelectItem value="shipstation">ShipStation</SelectItem>
                        <SelectItem value="shippo">Shippo</SelectItem>
                        <SelectItem value="pirateship">Pirate Ship</SelectItem>
                        <SelectItem value="manual">I'll create my own labels</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Using MarketPlace Labels gives you up to 90% off retail shipping rates
                    </p>

                    <div className="p-4 rounded-lg bg-muted">
                      <h5 className="font-medium mb-2">Supported Label Sizes</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">4x6 Thermal</Badge>
                        <Badge variant="outline">8.5x11 Paper</Badge>
                        <Badge variant="outline">4x4 Label</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Return Address</CardTitle>
                    <CardDescription>Your address for shipping labels and returns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Business/Name</Label>
                        <Input placeholder="Your Name or Business" />
                      </div>
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input placeholder="123 Main Street" />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label>State / ZIP</Label>
                        <div className="flex gap-2">
                          <Input placeholder="NY" className="w-20" />
                          <Input placeholder="10001" />
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Return Address
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Seller Tab */}
            <TabsContent value="seller">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Settings</CardTitle>
                  <CardDescription>Manage your seller profile and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">Seller Mode</p>
                      <p className="text-sm text-muted-foreground">Enable to list items for sale</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Store Settings</h4>
                    <div className="space-y-2">
                      <Label>Store Name</Label>
                      <Input placeholder="My Awesome Store" />
                    </div>
                    <div className="space-y-2">
                      <Label>Store Description</Label>
                      <Textarea placeholder="Tell buyers about your store..." rows={3} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Listing Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Offer local pickup</p>
                          <p className="text-sm text-muted-foreground">Allow buyers to pick up items</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Offer shipping</p>
                          <p className="text-sm text-muted-foreground">Ship items to buyers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Accept offers</p>
                          <p className="text-sm text-muted-foreground">Let buyers make offers on your items</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">General</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Message Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when you receive messages</p>
                      </div>
                      <Switch checked={messageAlerts} onCheckedChange={setMessageAlerts} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Buying</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Price Drop Alerts</p>
                        <p className="text-sm text-muted-foreground">Notify when saved items drop in price</p>
                      </div>
                      <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Listing Alerts</p>
                        <p className="text-sm text-muted-foreground">Notify for new items in your searches</p>
                      </div>
                      <Switch checked={newListingAlerts} onCheckedChange={setNewListingAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Package Tracking Updates</p>
                        <p className="text-sm text-muted-foreground">Get updates on your orders in transit</p>
                      </div>
                      <Switch checked={trackingAlerts} onCheckedChange={setTrackingAlerts} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Selling</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">Notify when you receive a payment</p>
                      </div>
                      <Switch checked={paymentAlerts} onCheckedChange={setPaymentAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payout Completed</p>
                        <p className="text-sm text-muted-foreground">Notify when payouts are sent to your account</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Order</p>
                        <p className="text-sm text-muted-foreground">Notify when someone purchases your item</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-muted-foreground">View and manage logged in devices</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50">
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
