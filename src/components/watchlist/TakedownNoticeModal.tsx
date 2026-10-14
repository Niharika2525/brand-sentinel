import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, FileText, ShieldAlert, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel";

type FlaggedAccount = Doc<"flaggedAccounts">;

interface TakedownNoticeModalProps {
  threat: FlaggedAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkReported?: () => void;
}

export function TakedownNoticeModal({
  threat,
  isOpen,
  onClose,
  onMarkReported,
}: TakedownNoticeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!threat) return null;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hostEntity =
    threat.platform === "instagram"
      ? "Meta Platforms Inc. Legal & IP Escalations (ip@meta.com)"
      : threat.platform === "x"
        ? "X Corp. Trust & Safety Legal Operations (copyright@x.com)"
        : threat.platform === "facebook"
          ? "Meta Platforms Inc. Commercial IP Operations (ip@fb.com)"
          : threat.platform === "linkedin"
            ? "LinkedIn Corporation Legal Trust & Safety (docketing@linkedin.com)"
            : threat.platform === "telegram"
              ? "Telegram FZ-LLC Trust & Safety Team (stopCA@telegram.org / abuse@telegram.org)"
              : threat.platform === "googleplay"
                ? "Google LLC Android Market Compliance & Legal Support (dmca-support@google.com)"
                : "Apple Inc. App Store Legal & Trademark Enforcement (appmarketlegal@apple.com)";

  const legalJurisdiction =
    "Digital Millennium Copyright Act (17 U.S.C. § 512), the Lanham Trademark Act (15 U.S.C. § 1051 et seq.), the Anticybersquatting Consumer Protection Act (15 U.S.C. § 1125(d)), and International WIPO Trademark Directives";

  const publisherMismatchSection =
    threat.publisherMismatch && threat.publisherName
      ? `\nCRITICAL PUBLISHER FRAUD & MISMATCH EVIDENCE:
- Official Registered Developer: "${threat.officialPublisher || `${threat.brandName} Corporate Entity`}"
- Unauthorized Rogue Publisher in Store Listing: "${threat.publisherName}"
- Evidence Finding: Direct violation of App Store Developer Guidelines; deceptive distribution under counterfeit developer signature.\n`
      : "";

  const homoglyphSection = threat.homoglyphSubstitution
    ? `\nTYPOSQUATTING & HOMOGLYPH VECTOR EVIDENCE:
- Analysis: ${threat.homoglyphSubstitution}
- Malicious Intent: Deceptive homoglyph designed to visually fool consumers and evade text search safety filters.\n`
    : "";

  const noticeText = `================================================================================
FORMAL NOTICE OF TRADEMARK INFRINGEMENT, PUBLISHER FRAUD & DMCA CEASE AND DESIST
Generated via Brand Sentinel Digital Risk Protection Platform
Date: ${dateStr}
Reference: BS-CASE-${threat._id.slice(-8).toUpperCase()}
================================================================================

TO:
${hostEntity}

FROM:
Brand Sentinel Cyber Risk Counsel
On behalf of: ${threat.brandName} Global Brand Protection Unit

SUBJECT:
URGENT: Expedited Takedown Request for Intellectual Property Infringement & Fraudulent Impersonation
Target: ${threat.displayName} (${threat.handle})

LEGAL BASIS:
This notice constitutes formal notification under the ${legalJurisdiction}, regarding unauthorized commercial trademark misuse, consumer deception, and active security threats targeting the protected intellectual property of "${threat.brandName}".

INFRINGING TARGET DETAILS:
- Platform / Channel: ${threat.platform.toUpperCase()}
- Impersonating Handle / Package ID: ${threat.handle}
- Store Display Name: ${threat.displayName}
- Threat Classification: ${threat.threatType.toUpperCase()}
- AI Risk Index: ${threat.riskScore}/100 (${threat.severity.toUpperCase()} RISK)
- First Discovered By Sentinel Crawlers: ${new Date(threat.detectedAt).toUTCString()}
${publisherMismatchSection}${homoglyphSection}
EVIDENCE & FORENSIC LOGS:
${threat.signals.map((sig, i) => `  ${i + 1}. [FORENSIC MATCH] ${sig}`).join("\n")}

STATEMENT OF INFRINGEMENT:
The entity operating under the identifier "${threat.handle}" is deliberately and deceitfully impersonating "${threat.brandName}" without license, permission, or lawful authorization. The profile/package exhibits active behavioral markers consistent with credential harvesting, typosquatting vectors, consumer fraud, and irreparable brand dilution.

DEMANDED ACTION:
We formally demand that you immediately:
1. Suspend, terminate, and remove access to the infringing account / application (${threat.handle}).
2. Preserve all server logs, IP connection records, and transaction histories associated with this target for future civil and criminal litigation.
3. Confirm in writing to takedown@brandsentinel.ai within twenty-four (24) hours once remediation is complete.

STATEMENT OF TRUTH:
I have a good faith belief that the disputed use of the trademarked and copyrighted materials described above is not authorized by the copyright/trademark owner, its agent, or the law. The information in this notification is accurate under penalty of perjury.

Respectfully submitted,

Authorized Brand Sentinel Legal Response Unit
Brand Protection Division · Brand Sentinel Inc.
Contact: enforcement@brandsentinel.ai | legal-desk@brandsentinel.ai
Case Ref: BS-${threat._id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}
================================================================================`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(noticeText);
      setCopied(true);
      toast.success("Legal Notice Copied to Clipboard", {
        description: `Ready to send to ${hostEntity.split(" ")[0]} abuse desk.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy notice to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([noticeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DMCA-Notice-${threat.brandName}-${threat.handle.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Legal Notice Downloaded", {
      description: "DMCA document saved as text file.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Legal Takedown Notice Generator
                <Badge variant="outline" className="text-xs uppercase border-red-500/30 text-red-500 bg-red-500/5">
                  DMCA § 512
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pre-filled formal Trademark Infringement & Cease-and-Desist package ready for submission.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Target summary bar */}
        <div className="rounded-lg border border-border bg-muted/40 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Protected Brand</span>
            <span className="font-semibold text-foreground">{threat.brandName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Platform</span>
            <span className="font-semibold capitalize text-foreground">{threat.platform}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Infringing Handle</span>
            <span className="font-mono font-medium text-foreground truncate block">{threat.handle}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Threat Risk</span>
            <span className="font-semibold text-red-500">{threat.riskScore}/100 ({threat.severity.toUpperCase()})</span>
          </div>
        </div>

        {/* Notice text box */}
        <div className="relative">
          <div className="flex items-center justify-between pb-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <FileText className="size-3.5" /> Generated Legal Notice Document
            </span>
            <span className="text-[11px]">UTF-8 Text Format</span>
          </div>
          <pre className="max-h-72 overflow-y-auto rounded-lg border border-border/80 bg-neutral-950 p-4 font-mono text-[12px] leading-relaxed text-neutral-200 select-all whitespace-pre-wrap">
            {noticeText}
          </pre>
        </div>

        {/* Recipient dispatch hint */}
        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs flex items-center justify-between">
          <span className="text-muted-foreground">
            <strong className="text-foreground">Official Abuse Endpoint:</strong> {hostEntity}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--signal-text)]">
            Verified Gateway <ExternalLink className="size-3" />
          </span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex w-full items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {onMarkReported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onMarkReported();
                    onClose();
                  }}
                  className="text-xs"
                >
                  Mark as Reported
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 text-xs"
              >
                <Download className="size-3.5" />
                Download .txt
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs bg-[var(--signal-text)] text-white hover:opacity-90"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy Full Notice"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
