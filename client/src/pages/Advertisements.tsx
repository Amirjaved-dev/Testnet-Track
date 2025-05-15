import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Advertisement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schema for advertisement
const adFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  placement: z.string().min(1, "Placement is required"),
  imageUrl: z.string().optional(),
  targetUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type AdFormValues = z.infer<typeof adFormSchema>;

export default function AdvertisementsPage() {
  const { user, isAdmin, signIn } = useAuth();
  const [, setLocation] = useLocation();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  // Set up form with react-hook-form
  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      content: "",
      placement: "home",
      imageUrl: "",
      targetUrl: "",
      isActive: true,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    },
  });

  // Fetch advertisements from Supabase
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .order('createdAt', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        setAds(data || []);
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        toast({
          title: "Error",
          description: "Failed to load advertisements",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAds();
  }, [toast]);

  // Handle form submission for creating/editing ads
  const onSubmit = async (data: AdFormValues) => {
    try {
      const isUpdate = isEditing !== null;
      
      if (isUpdate) {
        // Update existing advertisement
        const { error } = await supabase
          .from('advertisements')
          .update({
            ...data,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', isEditing);
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Success",
          description: "Advertisement updated successfully",
        });
      } else {
        // Create new advertisement
        const { error } = await supabase
          .from('advertisements')
          .insert({
            ...data,
            createdAt: new Date().toISOString(),
            createdBy: user?.email || "admin",
          });
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Success",
          description: "Advertisement created successfully",
        });
      }
      
      // Close the dialog and refresh the list
      setOpenDialog(false);
      
      // Clear form and state
      form.reset();
      setIsEditing(null);
      setIsCreating(false);
      
      // Refresh the advertisement list
      const { data: refreshedData, error: refreshError } = await supabase
        .from('advertisements')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (refreshError) {
        throw new Error(refreshError.message);
      }
      
      setAds(refreshedData || []);
    } catch (err) {
      console.error('Error saving advertisement:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save advertisement",
        variant: "destructive",
      });
    }
  };

  // Function to delete an advertisement
  const deleteAd = async (id: number) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Remove the ad from the local state
      setAds(ads.filter(ad => ad.id !== id));
      
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting advertisement:', err);
      toast({
        title: "Error",
        description: "Failed to delete advertisement",
        variant: "destructive",
      });
    }
  };

  // Function to edit an advertisement
  const editAd = (ad: Advertisement) => {
    setIsEditing(ad.id);
    setIsCreating(false);
    
    form.reset({
      title: ad.title,
      content: ad.content,
      placement: ad.placement,
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl || "",
      isActive: ad.isActive,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().substring(0, 10) : undefined,
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().substring(0, 10) : undefined,
    });
    
    setOpenDialog(true);
  };

  // Function to create a new advertisement
  const createNewAd = () => {
    setIsCreating(true);
    setIsEditing(null);
    
    form.reset({
      title: "",
      content: "",
      placement: "home",
      imageUrl: "",
      targetUrl: "",
      isActive: true,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    });
    
    setOpenDialog(true);
  };

  // Auto-login if not already authenticated
  useEffect(() => {
    // If no user is logged in, perform automatic login with admin credentials
    if (!user) {
      const autoLogin = async () => {
        await signIn("niceearn7@gmail.com", "Okara786@");
      };
      autoLogin();
    }
  }, [user, signIn]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Advertisement Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit and manage advertisements that appear on the site
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/admin")}>
            Back to Admin
          </Button>
          <Button onClick={createNewAd}>
            Create Advertisement
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Advertisements</CardTitle>
          <CardDescription>
            Displaying all advertisements in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading advertisements...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No advertisements found</p>
              <Button className="mt-4" onClick={createNewAd}>
                Create your first advertisement
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.placement}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ad.startDate ? (
                          <>
                            {new Date(ad.startDate).toLocaleDateString()}
                            {ad.endDate && ` - ${new Date(ad.endDate).toLocaleDateString()}`}
                          </>
                        ) : (
                          'No date range'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => editAd(ad)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteAd(ad.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for creating/editing ads */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing !== null ? 'Edit Advertisement' : 'Create Advertisement'}
            </DialogTitle>
            <DialogDescription>
              {isEditing !== null
                ? 'Update the advertisement details below'
                : 'Fill out the form to create a new advertisement'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Advertisement Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Advertisement content or description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="placement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a placement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="home">Home Page</SelectItem>
                        <SelectItem value="airdrop">Airdrop Page</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines where the ad will be displayed on the site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to an image to display with the advertisement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where users will go when they click on the advertisement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Toggle whether this advertisement is currently active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing !== null ? 'Update Advertisement' : 'Create Advertisement'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}