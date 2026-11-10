import type { Metadata } from "next";

import { VideoStudio } from "@/components/vid/video-studio";

export const metadata: Metadata = {
  title: "استوديو الفيديو",
  robots: { index: false, follow: false },
};

export default function VideoStudioPage() {
  return <VideoStudio />;
}
