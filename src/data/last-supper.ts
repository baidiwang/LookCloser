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
      region: { x: 0.35, y: 0.2, width: 0.3, height: 0.27 },
      annotationPlacement: { direction: "bottom", offset: { x: 0, y: 8 } },
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
      region: { x: 0.43, y: 0.43, width: 0.14, height: 0.34 },
      annotationPlacement: { direction: "right", offset: { x: 8, y: -4 } },
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
      region: { x: 0.27, y: 0.47, width: 0.13, height: 0.31 },
      annotationPlacement: { direction: "right", offset: { x: 8, y: -6 } },
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
      region: { x: 0.575, y: 0.37, width: 0.095, height: 0.27 },
      annotationPlacement: { direction: "left", offset: { x: -6, y: -8 } },
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
      region: { x: 0.39, y: 0.7, width: 0.23, height: 0.17 },
      annotationPlacement: { direction: "top", offset: { x: 0, y: -6 } },
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
      region: { x: 0.69, y: 0.46, width: 0.2, height: 0.32 },
      annotationPlacement: { direction: "left", offset: { x: -8, y: -4 } },
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
    {
      id: "left-edge-reaction",
      region: { x: 0.025, y: 0.45, width: 0.2, height: 0.34 },
      annotationPlacement: { direction: "right", offset: { x: 8, y: -2 } },
      label: "The first recoil",
      factualSeed:
        "At the far left, three apostles lean inward as if the news has just reached the edge of the table.",
      storySeeds: [
        "Their bodies create a compressed counterweight to the wider gestures on the opposite side.",
        "The outermost figure rises from his seat, turning listening into physical movement.",
        "Follow their shared lean toward the quieter figures beside them.",
      ],
      storyIndex: "VII",
    },
    {
      id: "peter-and-knife",
      region: { x: 0.2, y: 0.5, width: 0.115, height: 0.26 },
      annotationPlacement: { direction: "right", offset: { x: 8, y: 4 } },
      label: "The concealed blade",
      factualSeed:
        "Behind the cluster near Judas, Peter's hand turns a small knife away from the table.",
      storySeeds: [
        "The blade is easy to miss because it sits below the louder drama of faces and shoulders.",
        "Its backward angle adds a note of consequence to Peter's urgent forward lean.",
        "Look next at the quieter hand resting near the bread in front of Christ.",
      ],
      storyIndex: "VIII",
    },
    {
      id: "john-folded-inward",
      region: { x: 0.32, y: 0.44, width: 0.105, height: 0.27 },
      annotationPlacement: { direction: "left", offset: { x: -8, y: 2 } },
      label: "A figure folded inward",
      factualSeed:
        "John's pale face and lowered posture interrupt the sharper diagonals around him.",
      storySeeds: [
        "His inward curve creates a pocket of silence between Peter's urgency and Christ's stillness.",
        "The softened posture makes grief register before any explicit action occurs.",
        "Compare that folded silhouette with the open triangular shape at the center.",
      ],
      storyIndex: "IX",
    },
    {
      id: "ceiling-perspective",
      region: { x: 0.25, y: 0.03, width: 0.5, height: 0.2 },
      annotationPlacement: { direction: "bottom", offset: { x: 0, y: 8 } },
      label: "The room narrows",
      factualSeed:
        "The coffered ceiling contracts toward a single vanishing point behind Christ.",
      storySeeds: [
        "Architecture quietly organizes the scene before any gesture or expression is read.",
        "The converging beams make the painted room feel deeper while directing attention to its still center.",
        "Trace the same convergence along the wall hangings and table edges.",
      ],
      storyIndex: "X",
    },
    {
      id: "far-right-dialogue",
      region: { x: 0.835, y: 0.46, width: 0.145, height: 0.33 },
      annotationPlacement: { direction: "left", offset: { x: -8, y: 0 } },
      label: "The final question",
      factualSeed:
        "At the far right, the final pair turn toward each other rather than toward Christ.",
      storySeeds: [
        "Their exchange lets the announcement keep traveling even at the painting's outer boundary.",
        "One open palm asks for meaning while the seated elder receives the question with restraint.",
        "Follow that open hand leftward through the chain of gestures across the table.",
      ],
      storyIndex: "XI",
    },
    {
      id: "cloth-and-table-edge",
      region: { x: 0.68, y: 0.71, width: 0.14, height: 0.2 },
      annotationPlacement: { direction: "top", offset: { x: 0, y: -8 } },
      label: "The silent white field",
      factualSeed:
        "The long white cloth holds scattered dishes, folds, and woven borders beneath the human drama.",
      storySeeds: [
        "Its broad horizontal calm steadies the composition while every figure above it breaks into motion.",
        "Small folds and repeated objects turn the table into a measured visual rhythm.",
        "Look for where reaching hands interrupt that quiet band of white.",
      ],
      storyIndex: "XII",
    },
  ],
};
