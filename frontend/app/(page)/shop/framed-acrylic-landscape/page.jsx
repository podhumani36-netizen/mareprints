import styles from "../../../assest/style/Shop.module.css";
import HeroBanner from "../../../Components/minbanner";
import Products from "../../../Components/products";
import { shopData } from "../../../data/shopdata";

const landscapeProducts = shopData.filter((product) => product.type === "landscape");

export default function Shop() {
  return (
    <main className="shop">
      <HeroBanner
        title="Framed Acrylic Photo Landscape"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1773920975/ChatGPT_Image_Mar_19__2026__05_19_20_PM_jkluvh.png"
      />

      <div className="container my-5">
        <h2 className={styles.sectionTitle}>Framed Acrylic Photo Landscape</h2>
        <Products data={landscapeProducts} limit={null} link="/product" />
      </div>
    </main>
  );
}
