import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Privacy Policy</CardTitle>
        <CardDescription className="mt-2">
          MineFit is designed to keep your data on your device by default.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>What We Store</CardTitle>
        <CardDescription className="mt-2">
          Profile details, workouts, diet plans, reminders, and progress data are stored locally in your browser database.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Data Control</CardTitle>
        <CardDescription className="mt-2">
          You can export your data, import backups, or clear all local data anytime from Settings &gt; Privacy Controls.
        </CardDescription>
      </Card>
    </div>
  );
}
