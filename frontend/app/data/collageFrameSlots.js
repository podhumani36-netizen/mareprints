// Predefined photo-slot positions for every PNG frame.
// top, left, width, height — percentages (0-100) relative to the full frame image.
// r  — border-radius percentage relative to the slot's smaller dimension (0 = sharp).
// type — "portrait" | "landscape" | "square" (used for display hints only).

export const FRAME_SLOTS = {
  "birds-tree": [
    { id: 1, top: 4,  left: 30, width: 24, height: 12, type: "landscape", r: 0 },
    { id: 2, top: 24, left: 39, width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 3, top: 43, left: 8,  width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 4, top: 52, left: 39, width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 5, top: 22, left: 70, width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 6, top: 45, left: 72, width: 12, height: 18, type: "portrait",  r: 0 },
  ],

  "bottom-stand-grid": [
    { id: 1, top: 18, left: 5,  width: 24, height: 22, type: "landscape", r: 0 },
    { id: 2, top: 16, left: 34, width: 12, height: 14, type: "square",    r: 0 },
    { id: 3, top: 16, left: 47, width: 12, height: 14, type: "square",    r: 0 },
    { id: 4, top: 18, left: 66, width: 24, height: 22, type: "landscape", r: 0 },
    { id: 5, top: 42, left: 5,  width: 24, height: 22, type: "landscape", r: 0 },
    { id: 6, top: 30, left: 34, width: 25, height: 24, type: "landscape", r: 0 },
    { id: 7, top: 42, left: 66, width: 24, height: 22, type: "landscape", r: 0 },
  ],

  "family-center-grid": [
    { id: 1,  top: 4,  left: 10, width: 15, height: 16, type: "square",    r: 0 },
    { id: 2,  top: 4,  left: 28, width: 15, height: 16, type: "square",    r: 0 },
    { id: 3,  top: 4,  left: 56, width: 15, height: 16, type: "square",    r: 0 },
    { id: 4,  top: 4,  left: 74, width: 15, height: 16, type: "square",    r: 0 },
    { id: 5,  top: 27, left: 4,  width: 28, height: 20, type: "landscape", r: 0 },
    { id: 6,  top: 27, left: 68, width: 28, height: 20, type: "landscape", r: 0 },
    { id: 7,  top: 60, left: 10, width: 15, height: 16, type: "square",    r: 0 },
    { id: 8,  top: 60, left: 28, width: 15, height: 16, type: "square",    r: 0 },
    { id: 9,  top: 60, left: 56, width: 15, height: 16, type: "square",    r: 0 },
    { id: 10, top: 60, left: 74, width: 15, height: 16, type: "square",    r: 0 },
  ],

  "family-home-grid": [
    { id: 1,  top: 5,  left: 3,  width: 14, height: 15, type: "square",   r: 0 },
    { id: 2,  top: 5,  left: 19, width: 14, height: 15, type: "square",   r: 0 },
    { id: 3,  top: 5,  left: 35, width: 14, height: 15, type: "square",   r: 0 },
    { id: 4,  top: 5,  left: 51, width: 14, height: 15, type: "square",   r: 0 },
    { id: 5,  top: 5,  left: 67, width: 14, height: 15, type: "square",   r: 0 },
    { id: 6,  top: 26, left: 3,  width: 14, height: 19, type: "portrait", r: 0 },
    { id: 7,  top: 47, left: 3,  width: 14, height: 19, type: "portrait", r: 0 },
    { id: 8,  top: 26, left: 83, width: 14, height: 19, type: "portrait", r: 0 },
    { id: 9,  top: 47, left: 83, width: 14, height: 19, type: "portrait", r: 0 },
    { id: 10, top: 74, left: 3,  width: 14, height: 15, type: "square",   r: 0 },
    { id: 11, top: 74, left: 19, width: 14, height: 15, type: "square",   r: 0 },
    { id: 12, top: 74, left: 67, width: 14, height: 15, type: "square",   r: 0 },
    { id: 13, top: 74, left: 83, width: 14, height: 15, type: "square",   r: 0 },
  ],

  "family-script-grid": [
    { id: 1, top: 5,  left: 18, width: 18, height: 16, type: "square",   r: 0 },
    { id: 2, top: 5,  left: 41, width: 18, height: 16, type: "square",   r: 0 },
    { id: 3, top: 5,  left: 64, width: 18, height: 16, type: "square",   r: 0 },
    { id: 4, top: 27, left: 4,  width: 18, height: 28, type: "portrait", r: 0 },
    { id: 5, top: 27, left: 78, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 6, top: 63, left: 18, width: 18, height: 16, type: "square",   r: 0 },
    { id: 7, top: 63, left: 41, width: 18, height: 16, type: "square",   r: 0 },
    { id: 8, top: 63, left: 64, width: 18, height: 16, type: "square",   r: 0 },
  ],

  "family-wide-1": [
    { id: 1, top: 10, left: 5,  width: 22, height: 32, type: "portrait", r: 0 },
    { id: 2, top: 10, left: 34, width: 22, height: 42, type: "portrait", r: 0 },
    { id: 3, top: 10, left: 64, width: 12, height: 14, type: "square",   r: 0 },
    { id: 4, top: 10, left: 79, width: 12, height: 14, type: "square",   r: 0 },
    { id: 5, top: 46, left: 5,  width: 12, height: 14, type: "square",   r: 0 },
    { id: 6, top: 46, left: 20, width: 12, height: 14, type: "square",   r: 0 },
    { id: 7, top: 24, left: 64, width: 27, height: 28, type: "portrait", r: 0 },
  ],

  "family-wide-2": [
    { id: 1, top: 6,  left: 4,  width: 18, height: 34, type: "portrait",  r: 0 },
    { id: 2, top: 6,  left: 24, width: 18, height: 34, type: "portrait",  r: 0 },
    { id: 3, top: 6,  left: 58, width: 18, height: 34, type: "portrait",  r: 0 },
    { id: 4, top: 6,  left: 78, width: 18, height: 34, type: "portrait",  r: 0 },
    { id: 5, top: 44, left: 24, width: 24, height: 16, type: "landscape", r: 0 },
    { id: 6, top: 44, left: 50, width: 24, height: 16, type: "landscape", r: 0 },
  ],

  "floral-round": [
    { id: 1, top: 8,  left: 12, width: 18, height: 12, type: "landscape", r: 0 },
    { id: 2, top: 2,  left: 39, width: 14, height: 18, type: "portrait",  r: 0 },
    { id: 3, top: 9,  left: 62, width: 18, height: 12, type: "landscape", r: 0 },
    { id: 4, top: 27, left: 7,  width: 14, height: 18, type: "portrait",  r: 0 },
    { id: 5, top: 28, left: 73, width: 14, height: 18, type: "portrait",  r: 0 },
    { id: 6, top: 60, left: 32, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 7, top: 60, left: 58, width: 16, height: 10, type: "landscape", r: 0 },
  ],

  "full-tree-collage": [
    { id: 1, top: 10, left: 20, width: 12, height: 16, type: "portrait",  r: 0 },
    { id: 2, top: 5,  left: 42, width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 3, top: 16, left: 64, width: 12, height: 16, type: "portrait",  r: 0 },
    { id: 4, top: 42, left: 9,  width: 18, height: 12, type: "landscape", r: 0 },
    { id: 5, top: 46, left: 61, width: 18, height: 12, type: "landscape", r: 0 },
    { id: 6, top: 67, left: 16, width: 12, height: 16, type: "portrait",  r: 0 },
    { id: 7, top: 67, left: 68, width: 12, height: 16, type: "portrait",  r: 0 },
    { id: 8, top: 69, left: 42, width: 12, height: 14, type: "portrait",  r: 0 },
  ],

  "gift-lasts-forever": [
    { id: 1, top: 10, left: 5,  width: 18, height: 28, type: "portrait", r: 0 },
    { id: 2, top: 10, left: 27, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 3, top: 10, left: 49, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 4, top: 10, left: 71, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 5, top: 42, left: 5,  width: 18, height: 28, type: "portrait", r: 0 },
    { id: 6, top: 42, left: 27, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 7, top: 42, left: 49, width: 18, height: 28, type: "portrait", r: 0 },
    { id: 8, top: 42, left: 71, width: 18, height: 28, type: "portrait", r: 0 },
  ],

  "heart-family": [
    { id: 1, top: 10, left: 17, width: 12, height: 12, type: "square",    r: 0 },
    { id: 2, top: 8,  left: 42, width: 12, height: 18, type: "portrait",  r: 0 },
    { id: 3, top: 10, left: 65, width: 12, height: 12, type: "square",    r: 0 },
    { id: 4, top: 31, left: 10, width: 12, height: 12, type: "square",    r: 0 },
    { id: 5, top: 39, left: 28, width: 20, height: 12, type: "landscape", r: 0 },
    { id: 6, top: 39, left: 50, width: 20, height: 12, type: "landscape", r: 0 },
    { id: 7, top: 31, left: 78, width: 12, height: 12, type: "square",    r: 0 },
  ],

  "swirl-tree": [
    { id: 1, top: 8,  left: 9,  width: 22, height: 12, type: "landscape", r: 0 },
    { id: 2, top: 8,  left: 63, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 3, top: 26, left: 15, width: 14, height: 20, type: "portrait",  r: 0 },
    { id: 4, top: 32, left: 38, width: 18, height: 16, type: "square",    r: 0 },
    { id: 5, top: 28, left: 72, width: 14, height: 22, type: "portrait",  r: 0 },
    { id: 6, top: 58, left: 5,  width: 24, height: 12, type: "landscape", r: 0 },
    { id: 7, top: 56, left: 71, width: 14, height: 22, type: "portrait",  r: 0 },
  ],

  // r: 8 gives the rounded-rectangle corners that define this frame's look
  "leaf-tree-rounded": [
    { id: 1, top: 9,  left: 18, width: 16, height: 20, type: "portrait", r: 8 },
    { id: 2, top: 4,  left: 42, width: 16, height: 22, type: "portrait", r: 8 },
    { id: 3, top: 10, left: 66, width: 16, height: 20, type: "portrait", r: 8 },
    { id: 4, top: 38, left: 12, width: 16, height: 20, type: "portrait", r: 8 },
    { id: 5, top: 36, left: 42, width: 16, height: 22, type: "portrait", r: 8 },
    { id: 6, top: 42, left: 70, width: 16, height: 20, type: "portrait", r: 8 },
  ],

  "tree-family-1": [
    { id: 1, top: 2,  left: 40, width: 14, height: 18, type: "portrait",  r: 0 },
    { id: 2, top: 7,  left: 55, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 3, top: 2,  left: 78, width: 14, height: 20, type: "portrait",  r: 0 },
    { id: 4, top: 30, left: 8,  width: 14, height: 20, type: "portrait",  r: 0 },
    { id: 5, top: 38, left: 39, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 6, top: 34, left: 68, width: 14, height: 22, type: "portrait",  r: 0 },
    { id: 7, top: 63, left: 28, width: 20, height: 12, type: "landscape", r: 0 },
  ],

  "tree-family-2": [
    { id: 1, top: 6,  left: 21, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 2, top: 6,  left: 56, width: 22, height: 12, type: "landscape", r: 0 },
    { id: 3, top: 22, left: 6,  width: 14, height: 22, type: "portrait",  r: 0 },
    { id: 4, top: 18, left: 80, width: 14, height: 22, type: "portrait",  r: 0 },
    { id: 5, top: 54, left: 4,  width: 22, height: 12, type: "landscape", r: 0 },
    { id: 6, top: 58, left: 39, width: 20, height: 12, type: "landscape", r: 0 },
    { id: 7, top: 50, left: 76, width: 14, height: 22, type: "portrait",  r: 0 },
  ],

  "vertical-family-grid": [
    { id: 1,  top: 4,  left: 4,  width: 14, height: 14, type: "square",    r: 0 },
    { id: 2,  top: 4,  left: 21, width: 14, height: 14, type: "square",    r: 0 },
    { id: 3,  top: 4,  left: 38, width: 14, height: 14, type: "square",    r: 0 },
    { id: 4,  top: 4,  left: 55, width: 14, height: 14, type: "square",    r: 0 },
    { id: 5,  top: 4,  left: 72, width: 14, height: 14, type: "square",    r: 0 },
    { id: 6,  top: 28, left: 5,  width: 24, height: 22, type: "landscape", r: 0 },
    { id: 7,  top: 28, left: 71, width: 24, height: 22, type: "landscape", r: 0 },
    { id: 8,  top: 62, left: 4,  width: 14, height: 14, type: "square",    r: 0 },
    { id: 9,  top: 62, left: 21, width: 14, height: 14, type: "square",    r: 0 },
    { id: 10, top: 62, left: 55, width: 14, height: 14, type: "square",    r: 0 },
    { id: 11, top: 62, left: 72, width: 14, height: 14, type: "square",    r: 0 },
  ],
};

// Maps each frame filename to its FRAME_SLOTS key.
// Handles edge-case filenames (double-dot, duplicated name).
export const FRAME_SLOT_MAP = {
  "birds-tree.png":                          "birds-tree",
  "bottom-stand-grid.png":                   "bottom-stand-grid",
  "family-center-gridfamily-center-grid.png":"family-center-grid",
  "family-home-grid.png":                    "family-home-grid",
  "family-script-grid.png":                  "family-script-grid",
  "family-wide-1..png":                      "family-wide-1",
  "family-wide-2.png":                       "family-wide-2",
  "floral-round.png":                        "floral-round",
  "full-tree-collage.png":                   "full-tree-collage",
  "gift-lasts-forever.png":                  "gift-lasts-forever",
  "heart-family.png":                        "heart-family",
  "leaf-tree-rounded.png":                   "leaf-tree-rounded",
  "swirl-tree.png":                          "swirl-tree",
  "tree-family-1.png":                       "tree-family-1",
  "tree-family-2.png":                       "tree-family-2",
  "vertical-family-grid.png":                "vertical-family-grid",
};
