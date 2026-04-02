import styles from "../../../assest/style/Shop.module.css";
import HeroBanner from "../../../Components/minbanner";
import Products from "../../../Components/products";
import { shopData } from "../../../data/shopdata";

const cutoutProducts = shopData.filter((product) => product.type === "cutout");

export default function Shop() {
  return (
    <main className="shop">
      <HeroBanner
        title="Framed Acrylic Photo Cutout"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1772614051/interactive-web-design-online-art-gallery-featuring-immersive-visuals-easy-navigation-sleek-modern_1266280-95946_q0cs87.jpg"
      />

      <div className="container my-5">
        <h2 className={styles.sectionTitle}>Framed Acrylic Cut Out</h2>
        <Products data={cutoutProducts} limit={null} link="/product" />
      </div>
    </main>
  );
}
