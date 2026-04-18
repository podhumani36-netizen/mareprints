export default function ProductDescription({ shape }) {
  const getTitle = () => {
    if (shape === "portrait") {
      return "Luxury Acrylic Portrait Photo Frame - Museum Quality Wall Art";
    }
    if (shape === "landscape") {
      return "Luxury Acrylic Landscape Photo Frame - Museum Quality Wall Art";
    }
    return "Luxury Acrylic Photo Frame";
  };

  return (
    <div style={{ marginTop: "40px", padding: "20px", background: "#fff" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "600" }}>
        {getTitle()}
      </h2>

      <p>
        Exquisite Craftsmanship. Timeless Memories. Elevate your most cherished moments.
      </p>

      <ul>
        <li>✔ Premium Cast Acrylic</li>
        <li>✔ Crystal Clear High Gloss Finish</li>
        <li>✔ Ultra HD Printing</li>
        <li>✔ Scratch Resistant Surface</li>
        <li>✔ Easy Wall Mount Installation</li>
      </ul>
    </div>
  );
}