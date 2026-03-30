"use client";
import React from "react";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../../assest/style/ProductCard.module.css";

export default function ProductCard({ product }) {
  return (
    <div className={styles.productCard}>
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.overlay}>
          <Link href={`/product/${product.id}`} className={styles.viewBtn}>
            <i className="bi bi-eye me-2"></i>
            Quick View
          </Link>
        </div>
        {product.rating >= 4.9 && (
          <span className={styles.badge}>Best Seller</span>
        )}
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.name}</h3>
        <p className={styles.productType}>{product.type}</p>

        <div className={styles.rating}>
          <i className="bi bi-star-fill text-warning"></i>
          <span>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviews})</span>
        </div>

        <div className={styles.features}>
          {product.features?.slice(0, 2).map((feature, index) => (
            <span key={index} className={styles.feature}>
              {feature}
            </span>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>${product.price}</span>
          <Link
            href={`/product/${product.id}`}
            className={styles.detailsBtn}
            style={{ backgroundColor: product.themeColor || "#2C7FB8" }}
          >
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
