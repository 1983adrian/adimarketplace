import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Apple, 
  Play, 
  Terminal, 
  Copy, 
  Check, 
  Download,
  Settings,
  Bell,
  Shield,
  Rocket,
  FileCode,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminMobileApp = () => {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    toast({
      title: "Copiat!",
      description: `${label} a fost copiat în clipboard`,
    });
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const capacitorConfig = {
    appId: "app.lovable.e0bfe707146b4b72b4c4b072982fc18d",
    appName: "adimarketplace",
    webDir: "dist",
    server: {
      url: "https://e0bfe707-146b-4b72-b4c4-b072982fc18d.lovableproject.com?forceHideBadge=true",
      cleartext: true
    }
  };

  const commands = [
    { label: "Install Dependencies", command: "npm install" },
    { label: "Add iOS Platform", command: "npx cap add ios" },
    { label: "Add Android Platform", command: "npx cap add android" },
    { label: "Build Project", command: "npm run build" },
    { label: "Sync Capacitor", command: "npx cap sync" },
    { label: "Run iOS", command: "npx cap run ios" },
    { label: "Run Android", command: "npx cap run android" },
    { label: "Open iOS in Xcode", command: "npx cap open ios" },
    { label: "Open Android Studio", command: "npx cap open android" },
  ];

  const dependencies = [
    "@capacitor/core",
    "@capacitor/cli",
    "@capacitor/ios",
    "@capacitor/android",
    "@capacitor/push-notifications"
  ];

  const fcmConfig = `// Firebase Cloud Messaging Configuration
// Add to your Firebase Console -> Project Settings -> Cloud Messaging

FCM_SERVER_KEY: "your-fcm-server-key"
FCM_PROJECT_ID: "your-firebase-project-id"

// Google Services JSON (Android)
// Place in: android/app/google-services.json

// GoogleService-Info.plist (iOS)
// Place in: ios/App/App/GoogleService-Info.plist`;

  const capacitorConfigJson = `{
  "appId": "${capacitorConfig.appId}",
  "appName": "${capacitorConfig.appName}",
  "webDir": "dist",
  "server": {
    "url": "${capacitorConfig.server.url}",
    "cleartext": true
  },
  "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}`;

  const iosInfoPlist = `<!-- Add to ios/App/App/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>

<key>NSCameraUsageDescription</key>
<string>Camera access is required for taking photos of products</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required for uploading product images</string>`;

  const androidManifest = `<!-- Add to android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Inside <application> tag -->
<meta-data
  android:name="com.google.firebase.messaging.default_notification_channel_id"
  android:value="default" />`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-primary" />
              C Market - Aplicație Mobilă
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurație completă pentru iOS și Android
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Apple className="h-3 w-3" /> iOS Ready
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Play className="h-3 w-3" /> Android Ready
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">App ID</p>
                  <p className="font-mono text-xs truncate max-w-[150px]">{capacitorConfig.appId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Push Notifications</p>
                  <p className="font-medium text-amber-600">Demo Mode</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacitor</p>
                  <p className="font-medium">v8.0.1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Rocket className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hot Reload</p>
                  <p className="font-medium text-green-600">Activ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="config">Configurație</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Comenzi de Setup
                </CardTitle>
                <CardDescription>
                  Rulează aceste comenzi în ordine pentru a configura aplicația mobilă
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {commands.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{cmd.label}</p>
                        <code className="text-sm text-muted-foreground">{cmd.command}</code>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(cmd.command, cmd.label)}
                    >
                      {copiedCommand === cmd.label ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Dependențe Instalate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="font-mono">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pași pentru Deployment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge>1</Badge>
                    <div>
                      <p className="font-medium">Export la GitHub</p>
                      <p className="text-sm text-muted-foreground">
                        Transferă proiectul în repository-ul tău GitHub folosind "Export to Github"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge>2</Badge>
                    <div>
                      <p className="font-medium">Clone și Install</p>
                      <p className="text-sm text-muted-foreground">
                        <code>git clone [repo] && cd [project] && npm install</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge>3</Badge>
                    <div>
                      <p className="font-medium">Adaugă Platformele</p>
                      <p className="text-sm text-muted-foreground">
                        <code>npx cap add ios</code> și/sau <code>npx cap add android</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge>4</Badge>
                    <div>
                      <p className="font-medium">Build și Sync</p>
                      <p className="text-sm text-muted-foreground">
                        <code>npm run build && npx cap sync</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge>5</Badge>
                    <div>
                      <p className="font-medium">Rulează Aplicația</p>
                      <p className="text-sm text-muted-foreground">
                        <code>npx cap run ios</code> (necesită Mac + Xcode) sau <code>npx cap run android</code> (necesită Android Studio)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  capacitor.config.ts
                </CardTitle>
                <CardDescription>
                  Configurația principală Capacitor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{capacitorConfigJson}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(capacitorConfigJson, "Capacitor Config")}
                  >
                    {copiedCommand === "Capacitor Config" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>App Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App ID:</span>
                    <code className="text-sm">{capacitorConfig.appId}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App Name:</span>
                    <span className="font-medium">{capacitorConfig.appName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Web Directory:</span>
                    <code className="text-sm">{capacitorConfig.webDir}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hot Reload:</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Server Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Development URL:</span>
                    <p className="font-mono text-xs break-all mt-1">{capacitorConfig.server.url}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cleartext:</span>
                    <Badge variant="secondary">true</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* iOS Tab */}
          <TabsContent value="ios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Configurație iOS
                </CardTitle>
                <CardDescription>
                  Setări necesare pentru Info.plist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{iosInfoPlist}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(iosInfoPlist, "iOS Info.plist")}
                  >
                    {copiedCommand === "iOS Info.plist" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cerințe iOS</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    macOS cu Xcode instalat
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Apple Developer Account (pentru App Store)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    CocoaPods instalat
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    iOS 13.0+ minim suportat
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Android Tab */}
          <TabsContent value="android" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Configurație Android
                </CardTitle>
                <CardDescription>
                  Permisiuni pentru AndroidManifest.xml
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{androidManifest}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(androidManifest, "Android Manifest")}
                  >
                    {copiedCommand === "Android Manifest" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cerințe Android</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Android Studio instalat
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Android SDK 22+ (minim)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Google Play Developer Account (pentru Play Store)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    JDK 11+ instalat
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="push" className="space-y-4">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Bell className="h-5 w-5" />
                  Push Notifications - Demo Mode
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Pentru activare completă, configurează cheile Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 mb-4">
                  Push notifications funcționează în modul demo. Pentru a activa livrarea pe device-uri reale,
                  trebuie să configurezi Firebase Cloud Messaging.
                </p>
                <div className="relative">
                  <pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm border">
                    <code>{fcmConfig}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(fcmConfig, "FCM Config")}
                  >
                    {copiedCommand === "FCM Config" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Funcționalități Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Înregistrare token device
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Salvare în baza de date
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Notificări în-app (toast)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Navigare la tap
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Cleanup la logout
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evenimente Suportate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">order</Badge>
                      Comandă nouă / status
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">message</Badge>
                      Mesaj nou
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">bid</Badge>
                      Licitație nouă
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">shipping</Badge>
                      Update livrare
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">payout</Badge>
                      Plată procesată
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Documentation Link */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Documentație Capacitor</p>
                  <p className="text-sm text-muted-foreground">
                    Pentru mai multe detalii despre dezvoltarea mobilă
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="https://capacitorjs.com/docs" target="_blank" rel="noopener noreferrer">
                  Vizitează Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMobileApp;
