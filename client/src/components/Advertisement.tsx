import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Advertisement } from '@shared/schema';
import { supabase } from '@/lib/supabase';

interface AdvertisementProps {
  placement: string;
  className?: string;
}

export default function AdvertisementDisplay({ placement, className = '' }: AdvertisementProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        
        // Fetch active ad for the specified placement
        const { data, error: fetchError } = await supabase
          .from('advertisements')
          .select('*')
          .eq('placement', placement)
          .eq('isActive', true)
          .lte('startDate', new Date().toISOString())
          .gte('endDate', new Date().toISOString())
          .limit(1)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw new Error(fetchError.message);
        }
        
        setAd(data || null);
      } catch (err) {
        console.error('Error fetching advertisement:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAd();
  }, [placement]);

  if (loading) {
    return (
      <Card className={`w-full bg-muted/30 ${className}`}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p>Loading advertisement...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!ad) {
    return null; // Don't show anything if no ad is available
  }

  return (
    <Card className={`w-full border border-primary/20 overflow-hidden ${className}`}>
      {ad.imageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className={ad.imageUrl ? 'pt-3 pb-2' : ''}>
        <CardTitle className="text-lg font-bold">
          {ad.title}
        </CardTitle>
        {!ad.imageUrl && (
          <CardDescription>
            Ad
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="py-2">
        <p className="text-sm">{ad.content}</p>
      </CardContent>
      
      {ad.targetUrl && (
        <CardFooter className="pt-1 pb-3">
          <Button 
            size="sm" 
            className="w-full" 
            variant="outline"
            onClick={() => ad.targetUrl && window.open(ad.targetUrl, '_blank')}
          >
            Learn More
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}