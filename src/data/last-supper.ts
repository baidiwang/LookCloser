import type { ArtworkMetadata } from "@/types/artwork";

export const lastSupperArtwork: ArtworkMetadata = {
  id: "leonardo-last-supper",
  title: "The Last Supper",
  artist: "Leonardo da Vinci",
  date: "1495–1498",
  location: "Santa Maria delle Grazie · Milan",
  imageSrc: "/last-supper.jpg",
  imageAlt: "The Last Supper by Leonardo da Vinci",
  hotspots: [
    {
      id: "windows-and-horizon",
      region: { x: 0.35, y: 0.18, width: 0.3, height: 0.28 },
      label: "The distant landscape",
      factualSeed:
        "Three open windows frame a pale landscape directly behind Christ.",
      storySeeds: [
        "The distant landscape is the room's only open air and source of natural light.",
        "The central window gathers light around Christ without a conventional painted halo.",
        "Leonardo uses the opening as both architecture and a symbolic threshold beyond the human drama.",
      ],
      storyIndex: "I",
    },
    {
      id: "christ-at-center",
      region: { x: 0.43, y: 0.46, width: 0.14, height: 0.31 },
      label: "The still center",
      factualSeed:
        "Christ remains almost perfectly still while every figure around him reacts.",
      storySeeds: [
        "The ceiling, walls, and tapestries direct the painting's perspective lines toward Christ's head.",
        "His body forms a stable triangular silhouette against the apostles' waves of movement.",
        "Leonardo makes compositional stillness more forceful than the surrounding gestures.",
      ],
      storyIndex: "II",
    },
    {
      id: "judas-in-shadow",
      region: { x: 0.29, y: 0.49, width: 0.14, height: 0.3 },
      label: "Judas in shadow",
      factualSeed:
        "Judas recoils into shadow while remaining seated among the other apostles.",
      storySeeds: [
        "Unlike many earlier Last Supper paintings, Judas is not isolated on the opposite side of the table.",
        "His posture pulls backward and his face falls into shadow as the others lean into the news.",
        "A small purse in his hand alludes to the payment associated with the betrayal.",
      ],
      storyIndex: "III",
    },
    {
      id: "thomas-raised-finger",
      region: { x: 0.57, y: 0.4, width: 0.13, height: 0.27 },
      label: "A raised finger",
      factualSeed:
        "Thomas raises one finger through the surrounding unrest.",
      storySeeds: [
        "The gesture can suggest doubt, urgency, and recognition at once.",
        "It anticipates the later story of Thomas seeking physical proof of the resurrection.",
        "Leonardo returned to the upward-pointing gesture in other works, giving a small movement narrative weight.",
      ],
      storyIndex: "IV",
    },
    {
      id: "bread-and-hands",
      region: { x: 0.4, y: 0.76, width: 0.25, height: 0.18 },
      label: "Bread and hands",
      factualSeed:
        "Bread, wine, dishes, and overlapping hands form a second drama below the faces.",
      storySeeds: [
        "Christ and Judas reach near the same food, tightening the visual bond between communion and betrayal.",
        "The hands below repeat and complicate the emotional reactions visible in the faces above.",
        "Ordinary table objects become witnesses to the moment the gathering changes.",
      ],
      storyIndex: "V",
    },
    {
      id: "right-hand-conversation",
      region: { x: 0.7, y: 0.48, width: 0.23, height: 0.33 },
      label: "A wave of disbelief",
      factualSeed:
        "Overlapping gestures make the news appear to travel across the table in a wave.",
      storySeeds: [
        "Leonardo arranges the apostles in groups of three, each with its own rhythm of reaction.",
        "On the right, hands and glances overlap like fragments of simultaneous conversation.",
        "The scene feels spontaneous although every gesture is carefully choreographed.",
      ],
      storyIndex: "VI",
    },
  ],
};
