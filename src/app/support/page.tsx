import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Support</CardTitle>
        <CardDescription className="mt-2">
          Need help with MineFit features, data backup, or restore?
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Quick Help</CardTitle>
        <CardDescription className="mt-2">
          Use Settings to export a backup before changing devices, then import it on your new device.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Contact</CardTitle>
        <CardDescription className="mt-2">
          Add your support email or help center link here when ready.
        </CardDescription>
      </Card>
    </div>
  );
}
