import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function FileInputCard({ onFileChange }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block mx-auto border-gray-500 text-neutral-500 cursor-pointer"
        />
      </CardContent>
      <CardContent className="text-neutral-400 text-sm mx-2 space-y-6">
        No server-side processing. All operations are done in your browser.
        <br />
        Framed image is no exif data.
      </CardContent>
    </Card>
  );
}
