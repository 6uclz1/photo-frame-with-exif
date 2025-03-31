"use client";

import { useState, useRef } from "react";
import EXIF from "exif-js";
import { Inter } from "next/font/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<Record<string, any>>({});
  const [editableUpper, setEditableUpper] = useState<string>("");
  const [editableLower, setEditableLower] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setOriginalUrl(imageUrl);

      const img = new Image();
      img.onload = () => {
        // @ts-ignore
        EXIF.Tags[0xa432] = "LensSpecification";
        // @ts-ignore
        EXIF.Tags[0xa433] = "LensMake";
        // @ts-ignore
        EXIF.Tags[0xa434] = "LensModel";
        // @ts-ignore
        EXIF.Tags[0xa435] = "LensSerialNumber";

        EXIF.getData(img as unknown as string, function (this: any) {
          const allExif = EXIF.getAllTags(this);
          const finalExifData =
            Object.keys(allExif).length > 0 ? allExif : { Make: "No Exif" };
          setExifData(finalExifData);
          const { upperText, lowerText } = createCaption(finalExifData);
          setEditableUpper(upperText);
          setEditableLower(lowerText);
          draw(img, upperText, lowerText);
        });
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const draw = (img: HTMLImageElement, upperText: string, lowerText: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const HORIZONTAL_MARGIN = img.width * 0.025;
    const VERTICAL_MARGIN = img.width * 0.025;
    const BOTTOM_MARGIN =
      img.width > img.height ? img.height * 0.25 : img.width * 0.17;

    canvas.width = img.width + HORIZONTAL_MARGIN * 2;
    canvas.height = img.height + VERTICAL_MARGIN * 2 + BOTTOM_MARGIN;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, HORIZONTAL_MARGIN, VERTICAL_MARGIN, img.width, img.height);

    const BASE_FONT_SIZE =
      img.width > img.height ? img.height * 0.0275 : img.width * 0.02;
    const FONT_FAMILY = "Inter, sans-serif";
    const LINE_SPACING =
      img.width > img.height ? img.height * 0.005 : img.width * 0.0045;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textVerticalCenter =
      canvas.height - (BOTTOM_MARGIN + VERTICAL_MARGIN * 2) / 2;

    ctx.font = `700 ${BASE_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = "#000000";
    const upperTextY = textVerticalCenter - LINE_SPACING - BASE_FONT_SIZE / 2;
    ctx.fillText(upperText || "", canvas.width / 2, upperTextY);

    ctx.font = `400 ${BASE_FONT_SIZE * 0.8}px ${FONT_FAMILY}`;
    ctx.fillStyle = "#747474";
    const lowerTextY = textVerticalCenter + LINE_SPACING + BASE_FONT_SIZE / 2;
    ctx.fillText(lowerText, canvas.width / 2, lowerTextY);

    const resultUrl = canvas.toDataURL("image/jpeg");
    setProcessedUrl(resultUrl);
  };

  const createCaption = (exifData: Record<string, any>) => {
    let upperText = "";
    if (exifData.Make) {
      upperText = exifData.Make.toString().replace(/\u0000/g, "");
    }
    if (exifData.Model) {
      upperText += "  " + exifData.Model.toString().replace(/\u0000/g, "");
    }
    if (exifData.LensModel) {
      upperText += "  /  " + exifData.LensModel.toString().replace(/\u0000/g, "");
    }

    let exposureTime;
    if (exifData.ExposureTime !== undefined) {
      exposureTime =
        exifData.ExposureTime >= 1
          ? exifData.ExposureTime
          : `1/${Math.round(1 / exifData.ExposureTime)}`;
    } else {
      exposureTime = exifData.ExposureTimeString || "";
    }
    const focalLengthText = exifData.FocalLengthIn35mmFilm
      ? `${exifData.FocalLengthIn35mmFilm}mm`
      : "";
    const fNumberText = exifData.FNumber ? `f/${exifData.FNumber}` : "";
    const exposureText = exposureTime ? `${exposureTime}s` : "";
    const isoText = exifData.ISOSpeedRatings ? `ISO${exifData.ISOSpeedRatings}` : "";
    const lowerText = [focalLengthText, fNumberText, exposureText, isoText]
      .filter(Boolean)
      .join("  ");

    return { upperText, lowerText };
  };

  const updateCaption = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.onload = () => {
      draw(img, editableUpper, editableLower);
    };
    img.src = originalUrl;
  }

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = "processed-frame.jpeg";
    a.click();
  };

  return (
    <div className={`${inter.className} max-w-2xl mx-auto p-6 space-y-6`}>
      <Card>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block mx-auto border-gray-500 text-neutral-500 cursor-pointer"
          />
        </CardContent>
        <CardContent className="text-neutral-400 text-sm mx-2 space-y-6">
          No server-side processing. All operations are done in your browser.
          <br />
          Framed image is no exif data.
        </CardContent>
      </Card>

      {originalUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Original</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <img src={originalUrl} alt="Original" className="border mx-auto" />
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {processedUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Framed img</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <img src={processedUrl} alt="Processed" className="border mx-auto shadow-lg" />
            <div className="flex justify-center space-x-4">
              <Button variant="default" onClick={handleDownload}>
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
                  onChange={(e) => setEditableUpper(e.target.value)}
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
                  onChange={(e) => setEditableLower(e.target.value)}
                  className="mt-1 w-full"
                />
              </div>
              <Button variant="outline" onClick={updateCaption} className="w-full">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(exifData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Exif Info</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-auto bg-gray-700 p-4 rounded text-sm">
            {JSON.stringify(exifData, null, 2)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
