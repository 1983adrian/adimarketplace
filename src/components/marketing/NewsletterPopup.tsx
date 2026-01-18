import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Gift, X } from "lucide-react";

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already seen/dismissed the popup
    const hasSeenPopup = localStorage.getItem("newsletter_popup_seen");
    const lastShown = localStorage.getItem("newsletter_popup_last_shown");
    
    // Show popup after 5 seconds if not seen in last 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const shouldShow = !hasSeenPopup || (lastShown && parseInt(lastShown) < sevenDaysAgo);

    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("newsletter_popup_last_shown", Date.now().toString());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Te rugăm să introduci adresa de email");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase().trim(),
          name: name || null,
          source: "popup"
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("Ești deja abonat la newsletter!");
        } else {
          throw error;
        }
      } else {
        toast.success("Te-ai abonat cu succes! 🎉");
      }

      localStorage.setItem("newsletter_popup_seen", "true");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("newsletter_popup_seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Abonează-te la Newsletter!</DialogTitle>
          <DialogDescription className="text-base">
            Primește cele mai noi oferte, produse exclusive și reduceri speciale direct în inbox!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubscribe} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume (opțional)</Label>
            <Input
              id="name"
              placeholder="Numele tău"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="adresa@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Se procesează..." : "Abonează-mă"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Te poți dezabona oricând. Datele tale sunt în siguranță.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
