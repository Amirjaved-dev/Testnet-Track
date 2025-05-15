import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useAppConfig } from "@/lib/appConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppConfigSchema } from "@shared/schema";
import { z } from "zod";

export default function AdminPanel() {
  // Not using auth for direct admin access
  const { config, loading, error, updateConfig } = useAppConfig();
  const [activeTab, setActiveTab] = useState("general");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // We'll use a simpler approach for admin access
  // by removing authentication checks altogether

  // Define the form schema based on our AppConfig schema
  const formSchema = AppConfigSchema;
  
  // Use react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...config,
    },
  });

  // Update form values when config loads
  if (!form.formState.isDirty && !loading && config) {
    form.reset(config);
  }

  // Submit handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updateConfig(data);
      toast({
        title: "Settings updated",
        description: "The application settings have been successfully saved.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => setLocation("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={() => setLocation("/")} variant="outline">
          Back to Site
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Configure general app settings and appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Modify app name, colors, and other global settings
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab("general")}>
              Manage Settings
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Advertisements</CardTitle>
            <CardDescription>
              Manage advertisement content and placement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create, edit, and delete advertisements throughout the site
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/advertisements")}>
              Manage Advertisements
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Airdrop Criteria</CardTitle>
            <CardDescription>
              Configure airdrop eligibility requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set transaction requirements and other criteria for airdrop eligibility
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab("airdrop")}>
              Manage Criteria
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="airdrop">Airdrop Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>
                    Configure the general settings for your Monad Wallet Analyzer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="appName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Monad Wallet Analyzer" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed in the header and title of the application.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Analyze Monad wallets and check airdrop eligibility" {...field} />
                        </FormControl>
                        <FormDescription>
                          Brief description of what your application does.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="showAds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Advertisements</FormLabel>
                            <FormDescription>
                              Enable or disable advertisements on the site.
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="airdrop" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Airdrop Criteria</CardTitle>
                  <CardDescription>
                    Configure the criteria used to determine airdrop eligibility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="airdropRequirements.ethTransactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum ETH Transactions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum number of Ethereum Mainnet transactions required.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="airdropRequirements.monadTransactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Monad Transactions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="200" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum number of Monad Testnet transactions required.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="airdropRequirements.monTokenBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum MON Token Balance</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum MON token balance required.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="airdropRequirements.requireNadsNft"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Nads NFT</FormLabel>
                            <FormDescription>
                              Whether ownership of 1 Million Nads NFT is required.
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="airdropRequirements.requireEarlyAdopter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Early Adoption</FormLabel>
                            <FormDescription>
                              Whether transactions before Feb 26, 2025 are required.
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="text" placeholder="#6366f1" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              className="w-12 p-1 h-10"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Main color used throughout the application.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="text" placeholder="#8b5cf6" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              className="w-12 p-1 h-10"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Secondary color used for accents and gradients.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional URL to a custom logo image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset(config)}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}