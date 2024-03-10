import item1 from "./assets/item-1.png";
import item2 from "./assets/item-2.png";
import item3 from "./assets/item-3.png";
import item4 from "./assets/item-4.png";
import item5 from "./assets/item-5.png";
import item6 from "./assets/item-6.png";
import item7 from "./assets/item-7.png";

import room1Img from "./assets/room-1.png";
import room2Img from "./assets/room-2.png";
import room3Img from "./assets/room-3.png";
import room4Img from "./assets/room-4.png";
import room5Img from "./assets/room-5.png";

export const stats = [
  { id: 1, name: "Health", value: 3 },
  { id: 2, name: "Gold", value: 0 },
  { id: 3, name: "Strength", value: 1 },
  { id: 4, name: "Wisdom", value: 1 },
  { id: 5, name: "Agility", value: 1 },
];

export const items = [
  {
    id: 1,
    img: item1,
    name: "Vault",
    effect: "Gain 1 Gold per page flipped",
    // activations: [
    //   {
    //     room: 4,
    //     option: {
    //       label: "Give him the coin",
    //       page: 19,
    //     },
    //   },
    // ],
  },
  {
    id: 2,
    img: item2,
    name: "Torch",
    effect: "Unlocks Hidden Caves (Page 10).",
  },
  {
    id: 3,
    img: item3,
    name: "Sac",
    effect: "Holds keys",
  },
  {
    id: 4,
    img: item4,
    name: "Bag",
    effect: "+ 2 Inventory Slots",
  },
  {
    id: 5,
    img: item5,
    name: "Documents",
    effect: "Contains secret key to unlock Door (Page 6).",
  },
  {
    id: 6,
    img: item6,
    name: "Sword",
    effect: "Use: Deal 2 damage",
  },
  {
    id: 7,
    img: item7,
    name: "Skull",
    effect: "Use: Scare away enemies.",
  },
];

export const rooms = [
  {
    page: 1,
    name: "Skeleton Room",
    img: room1Img,
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
    img: room2Img,
    description:
      "A vast, open cavern where every sound is amplified into haunting echoes. Bioluminescent fungi illuminate the path, revealing ancient carvings on the walls. A clear stream flows gently, leading to a darkened passage. The air vibrates with a subtle, yet powerful energy.",
    options: [
      { label: "Obtain Bag", gain_item: 1, uses: 1 },
      { label: "Investigate the carvings", page: 5 },
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
    img: room3Img,
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
    img: room4Img,
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
    img: room5Img,
    description:
      "An endless corridor lined with mirrors, each reflecting a different aspect of reality. The reflections seem to move independently, suggesting alternate paths and outcomes. The air is filled with a sense of disorientation, making it hard to trust your senses. Will you find the way out, or become lost in what might have been?",
    options: [
      { label: "Follow a reflection that looks like you", page: 2 },
      { label: "Search for a mirror that does not reflect", page: 3 },
      { label: "Keep moving forward, ignoring the mirrors", page: 4 },
    ],
  },
];
