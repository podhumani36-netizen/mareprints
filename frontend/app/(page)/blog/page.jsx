import HeroBanner from "../../Components/minbanner";
import BlogComingSoon from "./coming-soon-banner";

function Blog() {
  return (
    <main className="blog-page">
      <HeroBanner
        title="out blog"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1773854065/ChatGPT_Image_Mar_18__2026__10_44_00_PM_jcshkn.png"
      />
      <BlogComingSoon />
    </main>
  );
}

export default Blog;