import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Megaphone, 
  Mail, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Send, 
  Facebook, 
  Instagram, 
  Twitter,
  Copy,
  Check,
  Loader2,
  BarChart3
} from "lucide-react";

export const AIMarketingDashboard = () => {
  const queryClient = useQueryClient();
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [socialContent, setSocialContent] = useState<Record<string, string>>({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    social_content: "",
    target_audience: "all"
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["marketing-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-marketing", {
        body: { action: "get_stats" }
      });
      if (error) throw error;
      return data.stats;
    }
  });

  // Fetch subscribers
  const { data: subscribers } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch campaigns
  const { data: campaigns } = useQuery({
    queryKey: ["marketing-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-marketing", {
        body: { action: "generate_content" }
      });
      if (error) throw error;
      return data.content;
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
      setNewCampaign(prev => ({
        ...prev,
        subject: content.subject || prev.subject,
        content: content.emailContent || prev.content,
        social_content: content.socialContent || prev.social_content
      }));
      toast.success("Conținut generat cu succes!");
    },
    onError: () => {
      toast.error("Eroare la generarea conținutului");
    }
  });

  // Generate social content for specific platform
  const generateSocialMutation = useMutation({
    mutationFn: async (platform: string) => {
      const { data, error } = await supabase.functions.invoke("ai-marketing", {
        body: { action: "generate_social", platform }
      });
      if (error) throw error;
      return { platform, content: data.content };
    },
    onSuccess: ({ platform, content }) => {
      setSocialContent(prev => ({ ...prev, [platform]: content }));
      toast.success(`Conținut ${platform} generat!`);
    },
    onError: () => {
      toast.error("Eroare la generarea conținutului social");
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("marketing_campaigns")
        .insert(newCampaign);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      setNewCampaign({ name: "", subject: "", content: "", social_content: "", target_audience: "all" });
      setGeneratedContent(null);
      toast.success("Campanie creată cu succes!");
    },
    onError: () => {
      toast.error("Eroare la crearea campaniei");
    }
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke("ai-marketing", {
        body: { action: "send_campaign", campaignId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success(data.message);
    },
    onError: () => {
      toast.error("Eroare la trimiterea campaniei");
    }
  });

  const copyToClipboard = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    toast.success("Copiat în clipboard!");
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const socialPlatforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-black" },
    { id: "tiktok", name: "TikTok", icon: Megaphone, color: "bg-black" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abonați Newsletter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campanii Trimise</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emailuri Trimise</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmailsSent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rată Deschidere</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Creare Campanie</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="campaigns">Campanii</TabsTrigger>
          <TabsTrigger value="subscribers">Abonați</TabsTrigger>
        </TabsList>

        {/* Create Campaign Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Creare Campanie cu AI
              </CardTitle>
              <CardDescription>
                Lasă AI-ul să genereze conținut promotional captivant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se generează...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generează Conținut cu AI
                  </>
                )}
              </Button>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nume Campanie</Label>
                  <Input
                    placeholder="ex: Oferte de Iarnă 2024"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subiect Email</Label>
                  <Input
                    placeholder="Subiectul emailului"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conținut Email (HTML)</Label>
                  <Textarea
                    placeholder="Conținutul emailului..."
                    rows={8}
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audiență Țintă</Label>
                  <Select
                    value={newCampaign.target_audience}
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, target_audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toți (Abonați + Utilizatori)</SelectItem>
                      <SelectItem value="subscribers">Doar Abonați Newsletter</SelectItem>
                      <SelectItem value="users">Doar Utilizatori Înregistrați</SelectItem>
                      <SelectItem value="sellers">Doar Vânzători</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => createCampaignMutation.mutate()}
                  disabled={!newCampaign.name || !newCampaign.subject || !newCampaign.content || createCampaignMutation.isPending}
                >
                  Creează Campanie
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generator Conținut Social Media</CardTitle>
              <CardDescription>
                Generează postări optimizate pentru fiecare platformă și copiază-le pentru a le publica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialPlatforms.map((platform) => (
                  <Card key={platform.id} className="overflow-hidden">
                    <CardHeader className={`${platform.color} text-white py-3`}>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <platform.icon className="h-5 w-5" />
                        {platform.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateSocialMutation.mutate(platform.id)}
                        disabled={generateSocialMutation.isPending}
                        className="w-full"
                      >
                        {generateSocialMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generează Post
                      </Button>

                      {socialContent[platform.id] && (
                        <div className="space-y-2">
                          <Textarea
                            value={socialContent[platform.id]}
                            onChange={(e) => setSocialContent(prev => ({ ...prev, [platform.id]: e.target.value }))}
                            rows={4}
                            className="text-sm"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(socialContent[platform.id], platform.id)}
                            className="w-full"
                          >
                            {copiedPlatform === platform.id ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Copiat!
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiază
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campanii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">{campaign.subject}</div>
                      <div className="flex gap-2">
                        <Badge variant={campaign.status === "sent" ? "default" : "secondary"}>
                          {campaign.status === "sent" ? "Trimis" : campaign.status === "draft" ? "Draft" : campaign.status}
                        </Badge>
                        {campaign.emails_sent > 0 && (
                          <Badge variant="outline">
                            {campaign.emails_sent} emailuri trimise
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => sendCampaignMutation.mutate(campaign.id)}
                          disabled={sendCampaignMutation.isPending}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Trimite
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {(!campaigns || campaigns.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    Nu ai creat nicio campanie încă
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Abonați Newsletter ({subscribers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscribers?.map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{sub.email}</div>
                      {sub.name && <div className="text-sm text-muted-foreground">{sub.name}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sub.is_active ? "default" : "secondary"}>
                        {sub.is_active ? "Activ" : "Dezabonat"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString("ro-RO")}
                      </span>
                    </div>
                  </div>
                ))}

                {(!subscribers || subscribers.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    Nu ai abonați încă. Popup-ul de newsletter va apărea automat vizitatorilor.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
