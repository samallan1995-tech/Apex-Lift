"use client";

import { useState, useRef, useTransition } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, PenIcon, TypeIcon, RotateCcwIcon, ShieldCheckIcon } from "lucide-react";
import { signContract } from "@/app/actions/signing";
import { useToast } from "@/components/ui/use-toast";

interface SigningPageClientProps {
  contractId: string;
  clientName: string;
  clientEmail: string;
}

export function SigningPageClient({ contractId, clientName, clientEmail }: SigningPageClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [signed, setSigned] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signerName, setSignerName] = useState(clientName);
  const [signerEmail, setSignerEmail] = useState(clientEmail);
  const [typedSignature, setTypedSignature] = useState("");
  const [activeTab, setActiveTab] = useState("draw");

  const canvasRef = useRef<SignatureCanvas>(null);

  function clearCanvas() {
    canvasRef.current?.clear();
  }

  async function handleSign() {
    if (!agreed) {
      toast({ title: "Please agree to the terms", variant: "destructive" });
      return;
    }
    if (!signerName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }

    let signatureData = "";

    if (activeTab === "draw") {
      if (canvasRef.current?.isEmpty()) {
        toast({ title: "Please draw your signature", variant: "destructive" });
        return;
      }
      signatureData = canvasRef.current?.toDataURL("image/png") || "";
    } else {
      if (!typedSignature.trim()) {
        toast({ title: "Please type your signature", variant: "destructive" });
        return;
      }
      signatureData = `typed:${typedSignature}`;
    }

    startTransition(async () => {
      try {
        await signContract(
          contractId,
          signatureData,
          signerName,
          signerEmail,
          "",
          typeof navigator !== "undefined" ? navigator.userAgent : ""
        );
        setSigned(true);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to sign contract",
          variant: "destructive",
        });
      }
    });
  }

  if (signed) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200">Contract Signed!</h2>
            <p className="text-green-700 dark:text-green-300 mt-2 text-sm">
              Thank you, {signerName}. Your signature has been recorded. A copy will be sent to {signerEmail}.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-xs text-left space-y-1 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-1.5 text-green-700 dark:text-green-300">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span className="font-medium">Audit trail recorded</span>
            </div>
            <p className="text-muted-foreground">Signer: {signerName} ({signerEmail})</p>
            <p className="text-muted-foreground">Timestamp: {new Date().toISOString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PenIcon className="w-4 h-4" />
          Sign Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="signerName" className="text-xs">Full Name *</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Your full name"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signerEmail" className="text-xs">Email Address *</Label>
            <Input
              id="signerEmail"
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-9 text-sm"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="draw" className="text-xs">
              <PenIcon className="w-3.5 h-3.5 mr-1.5" />
              Draw Signature
            </TabsTrigger>
            <TabsTrigger value="type" className="text-xs">
              <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
              Type Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-3">
            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-950">
              <SignatureCanvas
                ref={canvasRef}
                penColor="#1e293b"
                canvasProps={{
                  className: "w-full",
                  style: { height: "160px", width: "100%" },
                }}
                backgroundColor="transparent"
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600 mx-6 pointer-events-none" />
              <p className="absolute bottom-2 left-6 text-xs text-gray-400 pointer-events-none">Sign here</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="mt-2 h-7 text-xs"
            >
              <RotateCcwIcon className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </TabsContent>

          <TabsContent value="type" className="mt-3">
            <div className="space-y-2">
              <Input
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your full name"
                className="h-12 text-lg font-cursive text-gray-900 dark:text-white"
                style={{ fontFamily: "cursive" }}
              />
              {typedSignature && (
                <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 text-center">
                  <p style={{ fontFamily: "cursive", fontSize: "24px" }} className="text-gray-900 dark:text-white">
                    {typedSignature}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="agree" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
            I agree to the terms and conditions of this contract. I understand this constitutes a legally binding
            electronic signature and I am authorised to sign on behalf of the organisation named above.
          </label>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSign}
          disabled={isPending || !agreed}
        >
          {isPending ? (
            "Signing..."
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Sign Contract
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
