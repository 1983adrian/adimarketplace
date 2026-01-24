import React, { useState, useEffect } from 'react';
import { MapPin, Package, Clock, Navigation, Search, Loader2, CheckCircle2, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

export interface LockerLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  lat: number;
  lng: number;
  courier: 'sameday' | 'cargus' | 'fan_courier';
  type: 'locker' | 'pudo' | 'office';
  schedule: string;
  supportsCOD: boolean;
  compartments?: number;
}

// Romanian counties for filtering
const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila',
  'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța',
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
  'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
  'Vâlcea', 'Vaslui', 'Vrancea'
];

/**
 * FALLBACK LOCKER DATA - Used only when courier API is not configured or unavailable.
 * In production, lockers are fetched from the real courier APIs via the 'courier-lockers' edge function.
 * Admin can configure API keys in /admin/couriers to enable real data.
 */
const FALLBACK_LOCKERS: LockerLocation[] = [
  {
    id: 'sameday-buc-1',
    name: 'Easybox Mega Mall',
    address: 'Bd. Pierre de Coubertin 3-5',
    city: 'București',
    county: 'București',
    postalCode: '021901',
    lat: 44.4268,
    lng: 26.1025,
    courier: 'sameday',
    type: 'locker',
    schedule: '24/7',
    supportsCOD: true,
    compartments: 48,
  },
  {
    id: 'sameday-buc-2',
    name: 'Easybox AFI Cotroceni',
    address: 'Bd. Vasile Milea 4',
    city: 'București',
    county: 'București',
    postalCode: '061344',
    lat: 44.4319,
    lng: 26.0528,
    courier: 'sameday',
    type: 'locker',
    schedule: '08:00 - 22:00',
    supportsCOD: true,
    compartments: 36,
  },
  {
    id: 'cargus-buc-1',
    name: 'Ship & Go Unirii',
    address: 'Piața Unirii 1',
    city: 'București',
    county: 'București',
    postalCode: '030167',
    lat: 44.4268,
    lng: 26.1025,
    courier: 'cargus',
    type: 'pudo',
    schedule: '09:00 - 21:00',
    supportsCOD: true,
  },
  {
    id: 'fan-buc-1',
    name: 'FANbox Victoriei',
    address: 'Calea Victoriei 155',
    city: 'București',
    county: 'București',
    postalCode: '010073',
    lat: 44.4500,
    lng: 26.0850,
    courier: 'fan_courier',
    type: 'locker',
    schedule: '24/7',
    supportsCOD: true,
    compartments: 24,
  },
  {
    id: 'sameday-cluj-1',
    name: 'Easybox Iulius Mall Cluj',
    address: 'Str. Alexandru Vaida Voevod 53B',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    postalCode: '400436',
    lat: 46.7712,
    lng: 23.6236,
    courier: 'sameday',
    type: 'locker',
    schedule: '10:00 - 22:00',
    supportsCOD: true,
    compartments: 36,
  },
  {
    id: 'cargus-timis-1',
    name: 'Ship & Go Iulius Town Timișoara',
    address: 'Str. Aristide Demetriade 1',
    city: 'Timișoara',
    county: 'Timiș',
    postalCode: '300088',
    lat: 45.7489,
    lng: 21.2087,
    courier: 'cargus',
    type: 'pudo',
    schedule: '10:00 - 22:00',
    supportsCOD: true,
  },
  {
    id: 'sameday-iasi-1',
    name: 'Easybox Palas Mall Iași',
    address: 'Str. Palas 7A',
    city: 'Iași',
    county: 'Iași',
    postalCode: '700051',
    lat: 47.1585,
    lng: 27.5879,
    courier: 'sameday',
    type: 'locker',
    schedule: '08:00 - 22:00',
    supportsCOD: true,
    compartments: 48,
  },
];

interface LockerSelectorProps {
  selectedCourier: string;
  selectedLocker: LockerLocation | null;
  onLockerSelect: (locker: LockerLocation) => void;
  isCOD: boolean;
}

export const LockerSelector: React.FC<LockerSelectorProps> = ({
  selectedCourier,
  selectedLocker,
  onLockerSelect,
  isCOD,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [lockers, setLockers] = useState<LockerLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);

  // Filter lockers based on selected courier and search
  useEffect(() => {
    const fetchLockers = async () => {
      setLoading(true);
      
      // Try to fetch from real API first
      try {
        const { data, error } = await supabase.functions.invoke('courier-lockers', {
          body: { 
            courier: selectedCourier,
            county: selectedCounty,
            search: searchQuery,
          },
        });

        if (!error && data?.lockers?.length > 0) {
          setLockers(data.lockers);
          setUseRealAPI(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Courier API unavailable - using fallback locker data');
      }

      // Fallback to static data when API is not configured
      let filtered = FALLBACK_LOCKERS.filter(l => {
        // Filter by courier
        if (selectedCourier === 'sameday' && l.courier !== 'sameday') return false;
        if (selectedCourier === 'cargus' && l.courier !== 'cargus') return false;
        if (selectedCourier === 'fan_courier' && l.courier !== 'fan_courier') return false;
        
        // Filter by COD support
        if (isCOD && !l.supportsCOD) return false;
        
        // Filter by county
        if (selectedCounty && l.county !== selectedCounty) return false;
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            l.name.toLowerCase().includes(query) ||
            l.address.toLowerCase().includes(query) ||
            l.city.toLowerCase().includes(query)
          );
        }
        
        return true;
      });

      setLockers(filtered);
      setLoading(false);
    };

    fetchLockers();
  }, [selectedCourier, selectedCounty, searchQuery, isCOD]);

  const getCourierLabel = () => {
    switch (selectedCourier) {
      case 'sameday': return 'Easybox Sameday';
      case 'cargus': return 'Ship & Go Cargus';
      case 'fan_courier': return 'FANbox';
      default: return 'Locker/PUDO';
    }
  };

  const getCourierColor = () => {
    switch (selectedCourier) {
      case 'sameday': return 'bg-orange-500';
      case 'cargus': return 'bg-red-500';
      case 'fan_courier': return 'bg-blue-500';
      default: return 'bg-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Box className="h-5 w-5" />
          Alege punct de ridicare {getCourierLabel()}
          <Badge className={`ml-auto ${getCourierColor()} text-white`}>
            {lockers.length} locații
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau adresă..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează județul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate județele</SelectItem>
              {ROMANIAN_COUNTIES.map(county => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Locker List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Se încarcă locațiile...</span>
          </div>
        ) : lockers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nu s-au găsit locații pentru criteriile selectate</p>
            <p className="text-sm">Încearcă să modifici județul sau căutarea</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {lockers.map((locker) => {
                const isSelected = selectedLocker?.id === locker.id;
                
                return (
                  <div
                    key={locker.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => onLockerSelect(locker)}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCourierColor()} text-white`}>
                        {locker.type === 'locker' ? (
                          <Box className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{locker.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{locker.address}</p>
                        <p className="text-xs text-muted-foreground">{locker.city}, {locker.county}</p>
                        
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {locker.schedule}
                          </Badge>
                          {locker.type === 'locker' && locker.compartments && (
                            <Badge variant="outline" className="text-xs">
                              {locker.compartments} compartimente
                            </Badge>
                          )}
                          {locker.supportsCOD && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Acceptă Ramburs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Selected Locker Summary */}
        {selectedLocker && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{selectedLocker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocker.address}, {selectedLocker.city}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
