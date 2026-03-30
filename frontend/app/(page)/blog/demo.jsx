"use client";

import "../../assest/style/gobleblog.css";
import HeroBanner from "../../Components/minbanner";
import TableOfContents from "../../Components/tableofcontents";

function Demo() {
  return (
    <main>
      <HeroBanner
        title="out blog"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1771670768/blank-notebook-with-gold-frame-is-placed-vibrant-turquoise-background-adorned-with-lu_924727-114808_k5qczo.jpg"
      />
      <div className="globe-blog">
        <img
          src="https://res.cloudinary.com/dsprfys3x/image/upload/v1771840249/this-is-antique-photo-album-frame-vintage-scrapbook-image-with-modern-background-picture-layout-is-designed-family-portrait-photo-frame-is-intended-nostalgic-gallery_520737-13013_a52vfx.jpg"
          alt="demo image"
          className="img-fluid rounded-5"
        />
        <h1>hello</h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit, ipsum?
          Aut illo ut iste, nulla vel nam velit pariatur voluptatum, voluptas
          ullam a dignissimos possimus ipsam sunt vero magnam debitis.
        </p>

        <TableOfContents />

        <h2>Introduction to Blogging</h2>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Reprehenderit, tenetur laudantium alias mollitia doloremque commodi at
          ratione ipsa earum magni, corporis expedita pariatur repellat
          aspernatur unde deserunt, ipsum asperiores et?
        </p>

        <h3>Why Start a Blog</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>

        <h4>Benefits of Blogging</h4>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>

        <h2>Getting Started</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>

        <h3>Choose Your Niche</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>

        <h3>Set Up Your Blog</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>

        <h4>Platform Selection</h4>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, voluptatum.
        </p>
      </div>
    </main>
  );
}

export default Demo;
