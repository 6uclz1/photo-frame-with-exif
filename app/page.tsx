"use client";

import { useState, useRef } from "react";
import EXIF from "exif-js";
import { Inter } from "next/font/google";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FileInputCard } from "@/app/components/FileInputCard";
import { OriginalImageCard } from "@/app/components/OriginalImageCard";
import { ProcessedImageCard } from "@/app/components/ProcessedImageCard";
import { ExifInfoCard } from "@/app/components/ExifInfoCard";

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<Record<string, any>>({});
  const [editableUpper, setEditableUpper] = useState<string>("");
  const [editableLower, setEditableLower] = useState<string>("");
  const [frameType, setFrameType] = useState<"white" | "blur" | "black">("white");
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
      img.width > img.height ? img.height * 0.25 : img.width * 0.1;

    canvas.width = img.width + HORIZONTAL_MARGIN * 2;
    canvas.height = img.height + VERTICAL_MARGIN * 2 + BOTTOM_MARGIN;

    if (frameType === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (frameType === "blur") {
      // Draw blurred image
      ctx.filter = "blur(300px)";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Overlay with semi-transparent white
      ctx.fillStyle = "rgba(250, 250, 250, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (frameType === "black") {
      // Draw blurred image
      ctx.filter = "blur(300px)";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Overlay with semi-transparent black
      ctx.fillStyle = "rgba(30, 30, 30, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, HORIZONTAL_MARGIN, VERTICAL_MARGIN, img.width, img.height);

    const BASE_FONT_SIZE =
      img.width > img.height ? img.height * 0.0275 : img.width * 0.03;
    const FONT_FAMILY = "Inter, sans-serif";
    const LINE_SPACING =
      img.width > img.height ? img.height * 0.005 : img.width * 0.0045;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textVerticalCenter =
      canvas.height * 1.01 - (BOTTOM_MARGIN + VERTICAL_MARGIN * 2) / 2;

    ctx.font = `700 ${BASE_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = frameType === "black" ? "#ffffff" : "#000000"; // Set text color based on frameType
    const upperTextY = textVerticalCenter - LINE_SPACING - BASE_FONT_SIZE / 2;
    ctx.fillText(upperText || "", canvas.width / 2, upperTextY);

    ctx.font = `400 ${BASE_FONT_SIZE * 0.8}px ${FONT_FAMILY}`;
    ctx.fillStyle = frameType === "black" ? "#e0e0e0" : "#747474"; // Adjust lower text color for black frame
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
    const now = new Date();
    const formattedDate = now
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 15);
    a.download = `${formattedDate}`;
    a.click();
  };

  return (
    <div className={`${inter.className} max-w-2xl mx-auto p-6 space-y-6`}>
      <FileInputCard onFileChange={handleFileChange} />

      {originalUrl && <OriginalImageCard originalUrl={originalUrl} />}
      <canvas ref={canvasRef} className="hidden" />
      {processedUrl && (
        <>
          <ProcessedImageCard
          processedUrl={processedUrl}
          editableUpper={editableUpper}
          editableLower={editableLower}
          onUpperTextChange={setEditableUpper}
          onLowerTextChange={setEditableLower}
          onUpdateCaption={updateCaption}
          onDownload={handleDownload}
        />
          <Tabs defaultValue="white" onValueChange={(value) => setFrameType(value as "white" | "blur")}>
            <TabsList>
              <TabsTrigger value="white">White Frame</TabsTrigger>
              <TabsTrigger value="blur">Blur Frame</TabsTrigger>
              <TabsTrigger value="black">Black Frame</TabsTrigger>
            </TabsList>
          </Tabs>
        </>

        
      )}
      {Object.keys(exifData).length > 0 && <ExifInfoCard exifData={exifData} />}
    </div>
  );
}
