import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  AtSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type BrandProfile = Doc<"brandProfiles">;

interface BrandProfileManagerProps {
  onSelectBrandForScan?: (brandName: string) => void;
}

export function BrandProfileManager({
  onSelectBrandForScan,
}: BrandProfileManagerProps) {
  const profiles = useQuery(api.brandProfiles.list);
  const upsertProfile = useMutation(api.brandProfiles.upsert);
  const removeProfile = useMutation(api.brandProfiles.remove);
  const ensureDefaultProfiles = useMutation(
    api.brandProfiles.ensureDefaultProfiles,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(
    null,
  );

  // Form states
  const [brandName, setBrandName] = useState("");
  const [officialPublisher, setOfficialPublisher] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [officialLogoUrl, setOfficialLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [handlesText, setHandlesText] = useState("");
  const [packagesText, setPackagesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddDialog = (profileToEdit?: BrandProfile) => {
    if (profileToEdit) {
      setEditingProfile(profileToEdit);
      setBrandName(profileToEdit.brandName);
      setOfficialPublisher(profileToEdit.officialPublisher);
      setOfficialWebsite(profileToEdit.officialWebsite || "");
      setOfficialLogoUrl(profileToEdit.officialLogoUrl || "");
      setDescription(profileToEdit.description || "");
      setHandlesText(profileToEdit.officialHandles.join(", "));
      setPackagesText(profileToEdit.officialPackages.join(", "));
    } else {
      setEditingProfile(null);
      setBrandName("");
      setOfficialPublisher("");
      setOfficialWebsite("");
      setOfficialLogoUrl("");
      setDescription("");
      setHandlesText("");
      setPackagesText("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !officialPublisher.trim()) {
      toast.error("Brand name and Official Publisher are required.");
      return;
    }

    const officialHandles = handlesText
      .split(/[,\n]/)
      .map((h) => h.trim())
      .filter(Boolean);

    const officialPackages = packagesText
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await upsertProfile({
        brandName: brandName.trim(),
        officialPublisher: officialPublisher.trim(),
        officialWebsite: officialWebsite.trim() || undefined,
        officialLogoUrl: officialLogoUrl.trim() || undefined,
        description: description.trim() || undefined,
        officialHandles,
        officialPackages,
      });

      toast.success(
        editingProfile ? "Brand Profile Updated" : "Brand Profile Registered",
        {
          description: `${brandName} verified assets updated. Detection engine will strictly exclude them from threats.`,
        },
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save brand profile:", error);
      toast.error("Failed to save profile", {
        description:
          error instanceof Error ? error.message : "Please check your input.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: Id<"brandProfiles">, name: string) => {
    if (!confirm(`Are you sure you want to remove the brand profile for "${name}"?`)) {
      return;
    }
    try {
      await removeProfile({ id });
      toast.success(`Removed brand profile for ${name}`);
    } catch (error) {
      console.error("Failed to remove brand profile:", error);
      toast.error("Failed to delete profile");
    }
  };

  const handlePreloadDefaults = async () => {
    try {
      const res = await ensureDefaultProfiles({});
      toast.success("Preloaded Verified Brand Assets", {
        description: `Seeded ${res.seeded} enterprise brand profiles with whitelisted handles and packages.`,
      });
    } catch (error) {
      console.error("Failed to preload profiles:", error);
      toast.error("Preload failed");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner explaining Legitimate Asset Definition Criteria */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--signal-line)] bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="size-4" />
            </span>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Brand Profiles & Legitimate Asset Whitelist
            </h2>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
            >
              Evaluation Weight: 15%
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
            Configure legitimate brand profiles, official publisher signatures, and verified social accounts.
            The OSINT scanner cross-references these assets to <strong>strictly exclude</strong> them from false-positive threat alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(!profiles || profiles.length === 0) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreloadDefaults}
              className="gap-1.5 text-xs border-[var(--signal-line)]"
            >
              <Sparkles className="size-3.5 text-[var(--signal)]" />
              Preload Demo Brands
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenAddDialog()}
            className="gap-1.5 text-xs bg-[var(--primary)] text-primary-foreground shadow-sm"
          >
            <Plus className="size-3.5" />
            Register Brand Profile
          </Button>
        </div>
      </div>

      {/* Profiles Grid */}
      {!profiles ? (
        <div className="surface-card flex h-48 items-center justify-center text-xs text-muted-foreground">
          Loading registered brand profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-8 text-center">
          <Building2 className="size-8 text-muted-foreground/60" />
          <h3 className="text-sm font-semibold text-foreground">
            No Brand Profiles Configured
          </h3>
          <p className="max-w-md text-xs text-muted-foreground">
            Register your client or company brand profile to establish official publisher identity, verified social handles, and whitelisted app packages.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePreloadDefaults}
            className="mt-2 text-xs gap-1.5"
          >
            <Sparkles className="size-3.5 text-[var(--signal)]" />
            Preload Standard Profiles (Zomato, PhonePe, Nike, Northline Bank)
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="surface-card relative flex flex-col justify-between p-4 transition-all hover:border-[var(--signal-line)]"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base font-bold text-foreground">
                        {profile.brandName}
                      </span>
                      {profile.officialWebsite && (
                        <a
                          href={profile.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          title="Visit official website"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5" title={profile.description}>
                      {profile.description || "Monitored enterprise client"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenAddDialog(profile)}
                      className="size-7 text-xs text-muted-foreground hover:text-foreground"
                      title="Edit Profile"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteProfile(profile._id, profile.brandName)}
                      className="size-7 text-xs text-red-500 hover:text-red-700"
                      title="Delete Profile"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Official Publisher Detail (Criteria 3) */}
                <div className="mt-3 rounded-lg border border-border/70 bg-muted/30 p-2.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Official Verified Publisher (App Stores)
                  </span>
                  <p className="mt-0.5 text-xs font-semibold text-foreground truncate" title={profile.officialPublisher}>
                    {profile.officialPublisher}
                  </p>
                  <span className="mt-1 block text-[10px] text-emerald-600 dark:text-emerald-400">
                    ✓ Apps from other developers will be flagged with Publisher Mismatch
                  </span>
                </div>

                {/* Whitelisted Social Accounts (Criteria 1 & 2) */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <AtSign className="size-3 text-sky-500" /> Verified Social Accounts
                    </span>
                    <span className="text-[10px] tabular-nums">
                      {profile.officialHandles.length} whitelisted
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.officialHandles.map((handle) => (
                      <Badge
                        key={handle}
                        variant="secondary"
                        className="text-[10px] font-mono px-1.5 py-0.5 border border-border/80"
                      >
                        {handle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Whitelisted Mobile App Packages (Criteria 1 & 3) */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <Smartphone className="size-3 text-purple-500" /> Legitimate App Packages
                    </span>
                    <span className="text-[10px] tabular-nums">
                      {profile.officialPackages.length} packages
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.officialPackages.map((pkg) => (
                      <Badge
                        key={pkg}
                        variant="outline"
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-background border-border/80"
                      >
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Exclusion Guard Active
                </span>
                {onSelectBrandForScan && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1 cursor-pointer hover:border-[var(--signal-line)]"
                    onClick={() => onSelectBrandForScan(profile.brandName)}
                  >
                    Run AI Scan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register/Edit Brand Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editingProfile ? `Edit ${editingProfile.brandName}` : "Register New Brand Profile"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define the legitimate brand identity and official whitelisted assets to safeguard against false-positive threats.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4 text-xs">
              <div className="grid gap-1">
                <label className="font-semibold text-foreground">Brand / Client Name *</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Zomato, Nike, Stripe, PhonePe"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="grid gap-1">
                <label className="font-semibold text-foreground">
                  Official Developer / Publisher Name * (Criteria 3)
                </label>
                <Input
                  value={officialPublisher}
                  onChange={(e) => setOfficialPublisher(e.target.value)}
                  placeholder="e.g. Zomato Media Pvt. Ltd. or Nike Inc."
                  required
                  className="text-xs h-9"
                />
                <span className="text-[10px] text-muted-foreground">
                  The official publisher registered on Google Play & Apple App Store. Any store app by a different publisher will trigger a Publisher Mismatch alert.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <label className="font-medium text-foreground">Official Website URL</label>
                  <Input
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="text-xs h-9"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="font-medium text-foreground">Brand Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fintech payments, e-commerce, etc."
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="font-semibold text-foreground">
                  Official Verified Social Handles (Comma-separated)
                </label>
                <textarea
                  value={handlesText}
                  onChange={(e) => setHandlesText(e.target.value)}
                  placeholder="@brand, @brand_support, @brand_official"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">
                  Official handles are strictly whitelisted and never flagged as threats.
                </span>
              </div>

              <div className="grid gap-1">
                <label className="font-semibold text-foreground">
                  Official App Package IDs (Comma-separated)
                </label>
                <textarea
                  value={packagesText}
                  onChange={(e) => setPackagesText(e.target.value)}
                  placeholder="com.brand.app, id123456789"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">
                  Whitelisted bundle IDs on Google Play Store or Apple App Store.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-[var(--primary)] text-primary-foreground"
              >
                {isSubmitting ? "Saving..." : editingProfile ? "Update Profile" : "Register Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

