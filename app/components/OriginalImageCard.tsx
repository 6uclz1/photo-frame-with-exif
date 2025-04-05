import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function OriginalImageCard({ originalUrl }: { originalUrl: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Original</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <img src={originalUrl} alt="Original" className="border mx-auto" />
      </CardContent>
    </Card>
  );
}
