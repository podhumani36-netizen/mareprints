import Link from "next/link";
import styles from "../../../assest/style/Shop.module.css";
import HeroBanner from "../../../components/minbanner";
import Products from "../../../Components/products";
import { shopData } from "../../../data/shopdata";


export default function Shop() {
  return (
    <main className="shop">
      <HeroBanner
        title="Framed Acrylic Photo Portrait"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1773917307/ChatGPT_Image_Mar_19__2026__04_17_15_PM_hpicrk.png"
      />

      <div className="container my-5">
        <h2 className={styles.sectionTitle}>Framed Acrylic Photo Portrait</h2>
        <Products data={shopData[0].data} limit={null} link="/product" />
      </div>
    </main>
  );
}
