import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function ExifInfoCard({ exifData }: { exifData: Record<string, any> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Exif Info</CardTitle>
      </CardHeader>
      <CardContent className="max-h-64 overflow-auto bg-gray-700 p-4 rounded text-sm">
        {JSON.stringify(exifData, null, 2)}
      </CardContent>
    </Card>
  );
}
