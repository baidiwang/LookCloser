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
      curiosityLine: "The only open air in the room sits directly behind Christ.",
      storyTitle: "A window onto eternity",
      storyText:
        "Leonardo opens three windows behind the table, placing a softened landscape beyond the compressed drama of the room. Their pale light gathers around Christ without the need for a painted halo. The central opening becomes both architecture and symbol: a quiet threshold between the human scene and something immeasurably distant.",
      storyIndex: "I",
    },
    {
      id: "christ-at-center",
      region: { x: 0.43, y: 0.46, width: 0.14, height: 0.31 },
      label: "The still center",
      curiosityLine: "Amid every reaction, one figure remains almost perfectly still.",
      storyTitle: "The geometry of calm",
      storyText:
        "Every major perspective line—the ceiling, walls, and tapestries—converges at Christ's head. Around him the apostles break into waves of alarm, yet his triangular silhouette stays grounded and symmetrical. Leonardo makes stillness, rather than movement, the painting's strongest force.",
      storyIndex: "II",
    },
    {
      id: "judas-in-shadow",
      region: { x: 0.29, y: 0.49, width: 0.14, height: 0.3 },
      label: "Judas in shadow",
      curiosityLine: "One face withdraws from the light while the others lean forward.",
      storyTitle: "The figure who pulls away",
      storyText:
        "Judas is not isolated on the opposite side of the table, as earlier painters often showed him. Leonardo keeps him inside the group, but lets his posture recoil and his face fall into shadow. A small purse rests in his hand; his body knows the betrayal before the room does.",
      storyIndex: "III",
    },
    {
      id: "thomas-raised-finger",
      region: { x: 0.57, y: 0.4, width: 0.13, height: 0.27 },
      label: "A raised finger",
      curiosityLine: "A single finger points upward through the surrounding unrest.",
      storyTitle: "A gesture that returns",
      storyText:
        "Thomas raises one finger in a gesture of doubt, urgency, and recognition. The motif quietly anticipates the story for which he will be remembered—and echoes a pointing gesture Leonardo would use again in later works. Here, a tiny movement carries a future narrative.",
      storyIndex: "IV",
    },
    {
      id: "bread-and-hands",
      region: { x: 0.4, y: 0.76, width: 0.25, height: 0.18 },
      label: "Bread and hands",
      curiosityLine: "The quietest objects on the table hold the scene's deepest meaning.",
      storyTitle: "A table charged with meaning",
      storyText:
        "The bread, wine, dishes, and scattered hands form a second drama beneath the faces. Christ reaches toward the meal as Judas reaches nearby, tightening the connection between communion and betrayal. Ordinary objects become witnesses to the instant the gathering changes forever.",
      storyIndex: "V",
    },
    {
      id: "right-hand-conversation",
      region: { x: 0.7, y: 0.48, width: 0.23, height: 0.33 },
      label: "A wave of disbelief",
      curiosityLine: "The news travels across the table like a visible wave.",
      storyTitle: "Thirteen reactions, one moment",
      storyText:
        "Leonardo organizes the apostles into groups of three, giving each cluster its own rhythm of protest, disbelief, or private calculation. On the right, gestures overlap like fragments of conversation. The composition feels spontaneous, but every hand and glance has been choreographed.",
      storyIndex: "VI",
    },
  ],
};
