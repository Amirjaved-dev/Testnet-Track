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

  // Use dummy ad if there's an error or no ad found
  if (error || !ad) {
    // Create a dummy ad based on the placement
    const dummyAds = {
      'home': {
        title: 'Monad Testnet Live',
        content: 'Experience the future of blockchain with Monad Testnet',
        imageUrl: 'https://pbs.twimg.com/profile_images/1727846447165206528/JJ7cGjwf_400x400.jpg',
        targetUrl: 'https://monad.xyz'
      },
      'airdrop': {
        title: 'Join the Monad Community',
        content: 'Connect with other developers and enthusiasts',
        imageUrl: 'https://pbs.twimg.com/profile_images/1727846447165206528/JJ7cGjwf_400x400.jpg',
        targetUrl: 'https://discord.gg/monad'
      },
      'sidebar': {
        title: 'Monad Documentation',
        content: 'Learn how to build on Monad',
        imageUrl: '',
        targetUrl: 'https://docs.monad.xyz'
      },
      'airdrop-side': {
        title: 'Get Monad Updates',
        content: 'Stay informed about the latest developments',
        imageUrl: '',
        targetUrl: 'https://twitter.com/monad_xyz'
      }
    };
    
    // Default dummy ad for unknown placements
    const defaultDummyAd = {
      title: 'Monad Wallet Analyzer',
      content: 'Your gateway to the Monad ecosystem',
      imageUrl: '',
      targetUrl: 'https://monad.xyz'
    };
    
    // Set the dummy ad based on placement or use default
    const dummyAd = dummyAds[placement as keyof typeof dummyAds] || defaultDummyAd;
    
    return (
      <Card className={`w-full border border-primary/20 overflow-hidden ${className}`}>
        {dummyAd.imageUrl && (
          <div className="w-full h-40 overflow-hidden">
            <img 
              src={dummyAd.imageUrl} 
              alt={dummyAd.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className={dummyAd.imageUrl ? 'pt-3 pb-2' : ''}>
          <CardTitle className="text-lg font-bold">
            {dummyAd.title}
          </CardTitle>
          <CardDescription>
            Demo Ad
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-2">
          <p className="text-sm">{dummyAd.content}</p>
        </CardContent>
        
        {dummyAd.targetUrl && (
          <CardFooter className="pt-1 pb-3">
            <Button 
              size="sm" 
              className="w-full" 
              variant="outline"
              onClick={() => window.open(dummyAd.targetUrl, '_blank')}
            >
              Learn More
            </Button>
          </CardFooter>
        )}
      </Card>
    );
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