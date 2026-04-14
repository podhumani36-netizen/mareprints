// Predefined photo-slot positions for every PNG frame.
// x, y, w, h  — percentages (0-100) relative to the full frame image.
// r            — border-radius percentage relative to the slot's smaller dimension.

export const collageFrameSlots = {
  floralRound: {
    name: "Floral Round",
    slots: [
      { id: 1, x: 37, y: 6,  w: 13, h: 18, r: 2 },
      { id: 2, x: 13, y: 25, w: 15, h: 28, r: 2 },
      { id: 3, x: 72, y: 24, w: 15, h: 28, r: 2 },
      { id: 4, x: 3,  y: 47, w: 17, h: 26, r: 2 },
      { id: 5, x: 27, y: 48, w: 18, h: 17, r: 2 },
      { id: 6, x: 55, y: 48, w: 18, h: 17, r: 2 },
      { id: 7, x: 80, y: 47, w: 16, h: 26, r: 2 },
      { id: 8, x: 38, y: 70, w: 22, h: 18, r: 2 },
    ],
  },

  swirlTree: {
    name: "Swirl Tree",
    slots: [
      { id: 1, x: 10, y: 8,  w: 15, h: 18, r: 2 },
      { id: 2, x: 31, y: 8,  w: 13, h: 28, r: 2 },
      { id: 3, x: 71, y: 8,  w: 18, h: 18, r: 2 },
      { id: 4, x: 28, y: 32, w: 16, h: 21, r: 2 },
      { id: 5, x: 48, y: 28, w: 15, h: 26, r: 2 },
      { id: 6, x: 3,  y: 53, w: 18, h: 17, r: 2 },
      { id: 7, x: 80, y: 52, w: 14, h: 24, r: 2 },
    ],
  },

  leafTreeRounded: {
    name: "Leaf Tree Rounded",
    slots: [
      { id: 1, x: 24, y: 14, w: 18, h: 20, r: 8 },
      { id: 2, x: 55, y: 14, w: 18, h: 20, r: 8 },
      { id: 3, x: 13, y: 39, w: 18, h: 21, r: 8 },
      { id: 4, x: 40, y: 39, w: 18, h: 21, r: 8 },
      { id: 5, x: 67, y: 40, w: 18, h: 21, r: 8 },
    ],
  },

  birdsTree: {
    name: "Birds Tree",
    slots: [
      { id: 1, x: 34, y: 8,  w: 15, h: 14, r: 2 },
      { id: 2, x: 57, y: 18, w: 15, h: 18, r: 2 },
      { id: 3, x: 5,  y: 43, w: 14, h: 18, r: 2 },
      { id: 4, x: 32, y: 34, w: 14, h: 21, r: 2 },
      { id: 5, x: 33, y: 52, w: 14, h: 21, r: 2 },
      { id: 6, x: 69, y: 43, w: 14, h: 21, r: 2 },
    ],
  },

  fullTreeCollage: {
    name: "Full Tree Collage",
    slots: [
      { id: 1, x: 14, y: 24, w: 14, h: 17, r: 2 },
      { id: 2, x: 39, y: 8,  w: 16, h: 21, r: 2 },
      { id: 3, x: 69, y: 24, w: 14, h: 17, r: 2 },
      { id: 4, x: 2,  y: 47, w: 18, h: 15, r: 2 },
      { id: 5, x: 28, y: 49, w: 19, h: 15, r: 2 },
      { id: 6, x: 67, y: 47, w: 18, h: 15, r: 2 },
      { id: 7, x: 17, y: 66, w: 14, h: 16, r: 2 },
      { id: 8, x: 61, y: 66, w: 14, h: 16, r: 2 },
    ],
  },

  familyHomeGrid: {
    name: "Family Home Grid",
    slots: [
      { id: 1,  x: 3,  y: 9,  w: 15, h: 16, r: 0 },
      { id: 2,  x: 18, y: 9,  w: 18, h: 16, r: 0 },
      { id: 3,  x: 36, y: 9,  w: 18, h: 16, r: 0 },
      { id: 4,  x: 54, y: 9,  w: 18, h: 16, r: 0 },
      { id: 5,  x: 72, y: 9,  w: 15, h: 16, r: 0 },
      { id: 6,  x: 3,  y: 25, w: 15, h: 20, r: 0 },
      { id: 7,  x: 72, y: 25, w: 15, h: 20, r: 0 },
      { id: 8,  x: 3,  y: 45, w: 15, h: 16, r: 0 },
      { id: 9,  x: 72, y: 45, w: 15, h: 16, r: 0 },
      { id: 10, x: 3,  y: 61, w: 15, h: 16, r: 0 },
      { id: 11, x: 18, y: 61, w: 18, h: 16, r: 0 },
      { id: 12, x: 36, y: 61, w: 18, h: 16, r: 0 },
      { id: 13, x: 54, y: 61, w: 18, h: 16, r: 0 },
      { id: 14, x: 72, y: 61, w: 15, h: 16, r: 0 },
    ],
  },

  heartFamily: {
    name: "Heart Family",
    slots: [
      { id: 1, x: 22, y: 8,  w: 12, h: 13, r: 2 },
      { id: 2, x: 42, y: 8,  w: 12, h: 13, r: 2 },
      { id: 3, x: 60, y: 8,  w: 12, h: 13, r: 2 },
      { id: 4, x: 8,  y: 24, w: 12, h: 15, r: 2 },
      { id: 5, x: 31, y: 22, w: 14, h: 16, r: 2 },
      { id: 6, x: 52, y: 21, w: 14, h: 18, r: 2 },
      { id: 7, x: 75, y: 24, w: 12, h: 15, r: 2 },
      { id: 8, x: 33, y: 45, w: 17, h: 12, r: 2 },
      { id: 9, x: 52, y: 45, w: 17, h: 12, r: 2 },
    ],
  },

  familyWide1: {
    name: "Family Wide 1",
    slots: [
      { id: 1,  x: 14, y: 10, w: 15, h: 14, r: 0 },
      { id: 2,  x: 30, y: 10, w: 15, h: 14, r: 0 },
      { id: 3,  x: 46, y: 10, w: 15, h: 14, r: 0 },
      { id: 4,  x: 62, y: 10, w: 15, h: 14, r: 0 },
      { id: 5,  x: 3,  y: 26, w: 17, h: 23, r: 0 },
      { id: 6,  x: 74, y: 26, w: 17, h: 23, r: 0 },
      { id: 7,  x: 14, y: 50, w: 15, h: 14, r: 0 },
      { id: 8,  x: 30, y: 50, w: 15, h: 14, r: 0 },
      { id: 9,  x: 46, y: 50, w: 15, h: 14, r: 0 },
      { id: 10, x: 62, y: 50, w: 15, h: 14, r: 0 },
    ],
  },

  familyScriptGrid: {
    name: "Family Script Grid",
    slots: [
      { id: 1, x: 3,  y: 8,  w: 17, h: 23, r: 0 },
      { id: 2, x: 21, y: 8,  w: 16, h: 15, r: 0 },
      { id: 3, x: 37, y: 8,  w: 16, h: 15, r: 0 },
      { id: 4, x: 68, y: 8,  w: 17, h: 23, r: 0 },
      { id: 5, x: 3,  y: 31, w: 17, h: 18, r: 0 },
      { id: 6, x: 21, y: 31, w: 16, h: 18, r: 0 },
      { id: 7, x: 37, y: 31, w: 16, h: 18, r: 0 },
      { id: 8, x: 68, y: 31, w: 17, h: 18, r: 0 },
    ],
  },

  familyWide2: {
    name: "Family Wide 2",
    slots: [
      { id: 1,  x: 15, y: 9,  w: 13, h: 13, r: 0 },
      { id: 2,  x: 28, y: 9,  w: 13, h: 13, r: 0 },
      { id: 3,  x: 45, y: 9,  w: 13, h: 13, r: 0 },
      { id: 4,  x: 61, y: 9,  w: 13, h: 13, r: 0 },
      { id: 5,  x: 3,  y: 24, w: 19, h: 20, r: 0 },
      { id: 6,  x: 73, y: 24, w: 19, h: 20, r: 0 },
      { id: 7,  x: 15, y: 46, w: 13, h: 13, r: 0 },
      { id: 8,  x: 28, y: 46, w: 13, h: 13, r: 0 },
      { id: 9,  x: 61, y: 46, w: 13, h: 13, r: 0 },
      { id: 10, x: 74, y: 46, w: 13, h: 13, r: 0 },
    ],
  },

  giftLastsForever: {
    name: "Gift Lasts Forever",
    slots: [
      { id: 1, x: 4,  y: 27, w: 20, h: 30, r: 0 },
      { id: 2, x: 25, y: 27, w: 14, h: 15, r: 0 },
      { id: 3, x: 39, y: 27, w: 14, h: 15, r: 0 },
      { id: 4, x: 25, y: 42, w: 28, h: 18, r: 0 },
      { id: 5, x: 72, y: 27, w: 17, h: 30, r: 0 },
    ],
  },

  bottomStandGrid: {
    name: "Bottom Stand Grid",
    slots: [
      { id: 1, x: 3,  y: 8,  w: 24, h: 34, r: 0 },
      { id: 2, x: 27, y: 8,  w: 26, h: 38, r: 0 },
      { id: 3, x: 53, y: 8,  w: 17, h: 13, r: 0 },
      { id: 4, x: 70, y: 8,  w: 17, h: 13, r: 0 },
      { id: 5, x: 3,  y: 42, w: 11, h: 12, r: 0 },
      { id: 6, x: 14, y: 42, w: 12, h: 12, r: 0 },
      { id: 7, x: 53, y: 21, w: 34, h: 25, r: 0 },
    ],
  },

  familyCenterGrid: {
    name: "Family Center Grid",
    slots: [
      { id: 1, x: 3,  y: 8,  w: 18, h: 38, r: 0 },
      { id: 2, x: 21, y: 8,  w: 18, h: 17, r: 0 },
      { id: 3, x: 39, y: 8,  w: 18, h: 17, r: 0 },
      { id: 4, x: 75, y: 8,  w: 18, h: 38, r: 0 },
      { id: 5, x: 21, y: 46, w: 18, h: 17, r: 0 },
      { id: 6, x: 39, y: 46, w: 18, h: 17, r: 0 },
    ],
  },

  verticalFamilyGrid: {
    name: "Vertical Family Grid",
    slots: [
      { id: 1,  x: 3,  y: 8,  w: 12, h: 12, r: 0 },
      { id: 2,  x: 15, y: 8,  w: 12, h: 12, r: 0 },
      { id: 3,  x: 27, y: 8,  w: 12, h: 12, r: 0 },
      { id: 4,  x: 61, y: 8,  w: 12, h: 12, r: 0 },
      { id: 5,  x: 73, y: 8,  w: 12, h: 12, r: 0 },
      { id: 6,  x: 3,  y: 25, w: 21, h: 22, r: 0 },
      { id: 7,  x: 63, y: 25, w: 21, h: 22, r: 0 },
      { id: 8,  x: 3,  y: 47, w: 12, h: 12, r: 0 },
      { id: 9,  x: 15, y: 47, w: 12, h: 12, r: 0 },
      { id: 10, x: 63, y: 47, w: 12, h: 12, r: 0 },
      { id: 11, x: 75, y: 47, w: 12, h: 12, r: 0 },
    ],
  },

  treeFamily1: {
    name: "Tree Family 1",
    slots: [
      { id: 1, x: 36, y: 7,  w: 14, h: 18, r: 3 },
      { id: 2, x: 49, y: 9,  w: 20, h: 15, r: 3 },
      { id: 3, x: 72, y: 8,  w: 13, h: 21, r: 3 },
      { id: 4, x: 17, y: 33, w: 15, h: 25, r: 3 },
      { id: 5, x: 42, y: 34, w: 19, h: 16, r: 3 },
      { id: 6, x: 73, y: 35, w: 12, h: 24, r: 3 },
      { id: 7, x: 33, y: 59, w: 17, h: 16, r: 3 },
    ],
  },

  treeFamily2: {
    name: "Tree Family 2",
    slots: [
      { id: 1, x: 12, y: 8,  w: 13, h: 13, r: 2 },
      { id: 2, x: 35, y: 8,  w: 13, h: 18, r: 2 },
      { id: 3, x: 57, y: 8,  w: 14, h: 13, r: 2 },
      { id: 4, x: 81, y: 12, w: 12, h: 20, r: 2 },
      { id: 5, x: 4,  y: 23, w: 12, h: 19, r: 2 },
      { id: 6, x: 28, y: 26, w: 18, h: 14, r: 2 },
      { id: 7, x: 3,  y: 48, w: 16, h: 14, r: 2 },
      { id: 8, x: 46, y: 49, w: 18, h: 14, r: 2 },
      { id: 9, x: 75, y: 47, w: 12, h: 20, r: 2 },
    ],
  },
};

// Map each frame filename to its slot-config key
export const FRAME_SLOT_MAP = {
  "tree-family-1.png":                        "treeFamily1",
  "tree-family-2.png":                        "treeFamily2",
  "floral-round.png":                         "floralRound",
  "leaf-tree-rounded.png":                    "leafTreeRounded",
  "swirl-tree.png":                           "swirlTree",
  "birds-tree.png":                           "birdsTree",
  "full-tree-collage.png":                    "fullTreeCollage",
  "family-home-grid.png":                     "familyHomeGrid",
  "family-script-grid.png":                   "familyScriptGrid",
  "family-wide-2.png":                        "familyWide2",
  "gift-lasts-forever.png":                   "giftLastsForever",
  "heart-family.png":                         "heartFamily",
  "vertical-family-grid.png":                 "verticalFamilyGrid",
  "family-center-gridfamily-center-grid.png": "familyCenterGrid",
  "family-wide-1..png":                       "familyWide1",
  "bottom-stand-grid.png":                    "bottomStandGrid",
};
