"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext"; // Correct path: from Components to context
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";

const CartIcon = () => {
  const [mounted, setMounted] = useState(false);
  const { getItemCount } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link href="/cart" className="text-decoration-none position-relative">
        <div className="position-relative">
          <i className="bi bi-cart fs-4"></i>
        </div>
      </Link>
    );
  }

  const itemCount = getItemCount();

  return (
    <Link href="/cart" className="text-decoration-none position-relative">
      <div className="position-relative">
        <i className="bi bi-cart-fill fs-4"></i>
        {itemCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;