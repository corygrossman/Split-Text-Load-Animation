import localFont from "next/font/local";

export const drkText = localFont({
  src: [
    {
      path: "./DrukTextWide-Heavy-Trial.otf",
      weight: "900",
      variable: "--font-drk-text",
    },
  ],
});

export const ztBrosText = localFont({
  src: [
    {
      path: "./zt-formom-italic.otf",
      weight: "600",
    },
  ],
});

export const instrumentItalicText = localFont({
  src: [
    {
      path: "./InstrumentSerif-Italic.ttf",
      weight: "600",
    },
  ],
});

export const instrumentText = localFont({
  src: [
    {
      path: "./InstrumentSerif-Regular.ttf",
      weight: "600",
    },
  ],
});
