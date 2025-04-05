import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProcessedImageCard({
  processedUrl,
  editableUpper,
  editableLower,
  onUpperTextChange,
  onLowerTextChange,
  onUpdateCaption,
  onDownload,
}: {
  processedUrl: string;
  editableUpper: string;
  editableLower: string;
  onUpperTextChange: (value: string) => void;
  onLowerTextChange: (value: string) => void;
  onUpdateCaption: () => void;
  onDownload: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Framed img</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <img src={processedUrl} alt="Processed" className="border mx-auto shadow-lg" />
        <div className="flex justify-center space-x-4">
          <Button variant="default" onClick={onDownload}>
            Download
          </Button>
        </div>
        <CardTitle className="text-left">Text Edit</CardTitle>
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <Label htmlFor="upperText" className="block text-sm font-medium">
              Title
            </Label>
            <Input
              id="upperText"
              type="text"
              value={editableUpper}
              onChange={(e) => onUpperTextChange(e.target.value)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label htmlFor="lowerText" className="block text-sm font-medium">
              Description
            </Label>
            <Input
              id="lowerText"
              type="text"
              value={editableLower}
              onChange={(e) => onLowerTextChange(e.target.value)}
              className="mt-1 w-full"
            />
          </div>
          <Button variant="outline" onClick={onUpdateCaption} className="w-full">
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
