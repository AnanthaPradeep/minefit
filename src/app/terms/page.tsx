import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Terms of Use</CardTitle>
        <CardDescription className="mt-2">
          MineFit is provided for personal wellness planning and tracking.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Wellness Disclaimer</CardTitle>
        <CardDescription className="mt-2">
          Content in MineFit is not medical advice and should not replace professional consultation.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Responsible Use</CardTitle>
        <CardDescription className="mt-2">
          Use routines and plans according to your fitness level, health conditions, and local professional guidance.
        </CardDescription>
      </Card>
    </div>
  );
}
