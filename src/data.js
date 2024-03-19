export const rooms = [
  {
    page: 1,
    name: "Skeleton Room",
    description:
      "A dimly lit chamber, its stone walls adorned with eerie torch sconces casting flickering shadows. Dust-covered relics line the edges, hinting at forgotten tales. In the center, a mysterious altar exudes an otherworldly aura. The air is thick with ancient magic, invoking both awe and trepidation in adventurers.",
    options: [
      { label: "You drink the Potion", page: 2, gain_stat: { 1: -2 } },
      { label: "Eat the shroom", page: 3 },
      { label: "You inspect the altar", page: 4 },
    ],
  },
  {
    page: 2,
    name: "Cavern of Echoes",
    description:
      "A vast, open cavern where every sound is amplified into haunting echoes. Bioluminescent fungi illuminate the path, revealing ancient carvings on the walls. A clear stream flows gently, leading to a darkened passage. The air vibrates with a subtle, yet powerful energy.",
    options: [
      { label: "Obtain Bag", gain_item: 1, uses: 1 },
      {
        label: "Investigate the carvings",
        page: 5,
        blocked: {
          type: "hidden",
          requirement: "have item",
          item: 1,
        },
      },
      { label: "Enter the darkened passage", page: 3 },
      {
        label: "Break the Gem",
        page: 5,
        hidden: [{ item: 1 }, { stat: [2, "<", 3] }],
      },
    ],
  },
  {
    page: 3,
    name: "The Forgotten Library",
    description:
      "Rows upon rows of ancient books and scrolls fill this vast room, their knowledge lost to time. A single, dust-covered window lets in a beam of light, illuminating the golden letters on the spines of the books. The silence is almost palpable, broken only by the sound of a distant drip of water.",
    options: [
      { label: "Read a random book", page: 1 },
      { label: "Search for a secret passage", page: 4 },
      { label: "Examine the window", page: 5, gain_stat: { 1: 2 }, uses: 3 },
      {
        label: "Escape through the window",
        page: 5,
        locked: [{ item: 1 }, { stat: [1, ">", 9] }],
      },
    ],
  },
  {
    page: 4,
    name: "The Crystal Lake",

    description:
      "A serene lake lies before you, its waters crystal clear and still. Surrounding the lake, ancient trees whisper tales of old in the gentle breeze. At the center of the lake, a small island with a solitary tree beckons. The beauty of the scene belies the danger lurking beneath the surface.",
    options: [
      { label: "Swim to the island", page: 5 },
      { label: "Walk around the lake", page: 1 },
      { label: "Dive into the waters", page: 2 },
    ],
  },
  {
    page: 5,
    name: "The Hall of Mirrors",

    description:
      "An endless corridor lined with mirrors, each reflecting a different aspect of reality. The reflections seem to move independently, suggesting alternate paths and outcomes. The air is filled with a sense of disorientation, making it hard to trust your senses. Will you find the way out, or become lost in what might have been?",
    options: [
      { label: "Follow a reflection that looks like you", page: 2 },
      { label: "Search for a mirror that does not reflect", page: 3 },
      { label: "Keep moving forward, ignoring the mirrors", page: 4 },
    ],
  },
];
