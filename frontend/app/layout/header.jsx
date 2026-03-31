"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import styles from "../assest/style/nav.module.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userData = localStorage.getItem("user");

      setIsLoggedIn(loggedIn);

      if (loggedIn && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    checkLoginStatus();

    const handleLoginChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("loginStatusChanged", handleLoginChange);
    window.addEventListener("storage", handleLoginChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginChange);
      window.removeEventListener("storage", handleLoginChange);
    };
  }, []);
  
  const toggleDropdown = () => {
    if (isLoggedIn) {
      setIsDropdownOpen(!isDropdownOpen);
      if (isMenuOpen) setIsMenuOpen(false);
      if (isSearchOpen) setIsSearchOpen(false);
    } else {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);

    window.dispatchEvent(new Event("loginStatusChanged"));
    router.push("/");
  };
  
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          const totalItems = cartItems.reduce(
            (total, item) => total + (item.quantity || 1),
            0,
          );
          setCartItemCount(totalItems);
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error("Error reading cart:", error);
        setCartItemCount(0);
      }
    };

    updateCartCount();

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    {
      label: "Shop",
      dropdown: true,
      items: [
        { href: "/shop", label: "All Products" },
        {
          href: "/shop/framed-acrylic-portrait",
          label: "Framed Acrylic Photo Portrait",
        },
        {
          href: "/shop/framed-acrylic-landscape",
          label: "Framed Acrylic Photo Landscape",
        },
        {
          href: "/shop/framed-acrylic-cutout",
          label: "Framed Acrylic Cut Out",
        },
        {
          href: "/shop/framed-acrylic-nameplate",
          label: "Framed Acrylic Name Plate",
        },
      ],
    },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    // { href: "/profile", label: "Profile" },
  ];

  const isActiveLink = (href) => {
    return pathname === href;
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={`${styles.headerTop} d-none d-lg-block`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className={styles.topBarInfo}>
                <span>
                  <i className="bi bi-clock"></i> Mon - Sat: 9:00 AM - 8:00 PM
                </span>
              </div>
            </div>
            <div className="col-md-8 text-end">
              <div className={styles.topBarLinks}>
                <Link href="/shop/framed-acrylic-photo">
                  Framed Acrylic Photo Portrait
                </Link>
                <Link href="/shop/nameplate">
                  Framed Acrylic Photo Landscape
                </Link>
                <Link href="/shop/cutout">Framed Acrylic Cut Out</Link>
                <Link href="/shop/nameplate">Framed Acrylic Name Plate</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.headerMain}>
        <div className="container">
          <div className={styles.headerWrapper}>
            <Link href="/" className={styles.logo}>
              <Image
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773814201/7f83cd09-398d-46d3-9b93-df2a8bdbbf33-removebg-preview_brgxjh.png"
                alt="Mare Enterprises"
                width={150}
                height={50}
                className={styles.logoImage}
                priority
              />
            </Link>

            <nav className={`${styles.mainNav} d-none d-lg-block`}>
              <ul className={styles.navList}>
                {navLinks.map((link, index) => (
                  <li
                    key={index}
                    className={`${styles.navItem} ${link.dropdown ? styles.hasDropdown : ""}`}
                  >
                    {link.dropdown ? (
                      <>
                        <button className={styles.navLink}>
                          {link.label}
                          <i className="bi bi-chevron-down"></i>
                        </button>
                        <ul className={styles.dropdownMenu}>
                          {link.items.map((item, idx) => (
                            <li key={idx}>
                              <Link
                                href={item.href}
                                className={
                                  isActiveLink(item.href) ? styles.active : ""
                                }
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className={`${styles.navLink} ${isActiveLink(link.href) ? styles.active : ""}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.headerActions}>
              <button
                className={`${styles.actionBtn} ${styles.searchToggle}`}
                onClick={toggleSearch}
                aria-label="Search"
              >
                <i className="bi bi-search"></i>
              </button>

              <Link
                href="tel:+918148040202"
                className={`${styles.actionBtn} d-none d-md-flex`}
              >
                <i className="bi bi-phone"></i>
                <span className={styles.actionText}>+91 8148040202</span>
              </Link>

              <Link
                href="/cart"
                className={`${styles.actionBtn} ${styles.cartBtn}`}
              >
                <div className={styles.cartIcon}>
                  <i className="bi bi-bag"></i>
                  {cartItemCount > 0 && (
                    <span className={styles.cartCount}>{cartItemCount}</span>
                  )}
                </div>
                <span className={`${styles.actionText} d-none d-md-inline`}>
                  Cart
                </span>
              </Link>

              {/* <Link
              
                href="/login"
                className={`${styles.actionBtn} d-none d-md-flex`}
              >
                <i className="bi bi-person"></i>
                <span className={styles.actionText}>Account</span>
              </Link> */}

              <div className={styles.accountDropdown}>
                <button
                  className={`${styles.actionBtn} d-none d-md-flex`}
                  onClick={toggleDropdown}
                  aria-label="Account"
                >
                  <i className="bi bi-person"></i>
                  <span className={styles.actionText}>
                    {isLoggedIn && user ? `Hi, ${user.first_name}` : "Account"}
                  </span>
                  {isLoggedIn && (
                    <i className={`bi bi-chevron-down ${styles.dropdownIcon}`}></i>
                  )}
                </button>

                {isLoggedIn && isDropdownOpen && user && (
                  <div className={styles.dropdownContent}>
                    {/* Added User Avatar Image */}
                    <div className={styles.userAvatarContainer}>
                      <img 
                        src="https://res.cloudinary.com/dsprfys3x/image/upload/v1774587999/business-man-avatar-vector_1133257-2430_djdkaj.avif"
                        alt="User Avatar"
                        className={styles.userAvatar}
                        style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    </div>
                    
                    <div className={styles.userInfo}>
                      <div className={styles.userDetails}>
                        <h4>
                          {user.first_name} {user.last_name}
                        </h4>
                        {/* Added Email Display */}
                        {user.email && (
                          <p className={styles.userEmail}>
                            <i className="bi bi-envelope"></i> {user.email}
                          </p>
                        )}
                        <p>
                          <i className="bi bi-telephone"></i> {user.phone}
                        </p>
                      </div>
                    </div>

                    <div className={styles.dropdownDivider}></div>

                    <div className={styles.dropdownLinks}>
                      {/* <Link href="/profile" className={`${styles.dropdownLink} `}>
                        <i className="bi bi-person"></i> My Profile
                      </Link> */}
                      {/* <Link href="/orders" className={styles.dropdownLink}>
          <i className="bi bi-bag-check"></i> My Orders
        </Link> */}
                      <Link
                        href="/cart"
                        className={`${styles.actionBtn} ${styles.cartBtn}`}
                      >
                        <div className={styles.cartIcon}>
                          <i className="bi bi-bag"></i>
                          {cartItemCount > 0 && (
                            <span className={styles.cartCount}>{cartItemCount}</span>
                          )}
                        </div>
                        <span className={`${styles.actionText} d-none d-md-inline`}>
                          Cart
                        </span>
                      </Link>
                    </div>

                    <div className={styles.dropdownDivider}></div>

                    <button onClick={handleLogout} className={styles.logoutButton}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                className={`${styles.actionBtn} ${styles.menuToggle} justify-content-center d-lg-none ${isMenuOpen ? styles.active : ""}`}
                onClick={toggleMenu}
                aria-label="Menu"
              >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.searchOverlay} ${isSearchOpen ? styles.active : ""}`}
      >
        <div className="container">
          <button
            className={styles.closeSearch}
            onClick={toggleSearch}
            aria-label="Close search"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.searchSubmit}>
              <i className="bi bi-search"></i>
            </button>
          </form>
          <div className={styles.searchSuggestions}>
            <h4>Popular Searches:</h4>
            <div className={styles.suggestionTags}>
              <button onClick={() => router.push("/shop/cutout")}>
                Cutouts
              </button>
              <button onClick={() => router.push("/shop/framed-acrylic-photo")}>
                Framed Acrylic Photo Portrait
              </button>
              <button onClick={() => router.push("/shop/nameplate")}>
                Nameplates
              </button>
              <button onClick={() => router.push("/shop/photo")}>
                Photo Prints
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} d-lg-none ${isMenuOpen ? styles.active : ""}`}
      >
        <div className={styles.mobileMenuHeader}>
          <Link href="/" className={styles.mobileLogo}>
            <Image
              src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773814201/7f83cd09-398d-46d3-9b93-df2a8bdbbf33-removebg-preview_brgxjh.png"
              alt="Mare Enterprises"
              width={150}
              height={50}
              className={styles.logoImage}
              priority
            />
          </Link>
          <button
            className={styles.closeMenu}
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className={styles.mobileMenuBody}>
          <ul className={styles.mobileNavList}>
            {navLinks.map((link, index) => (
              <li key={index} className={styles.mobileNavItem}>
                {link.dropdown ? (
                  <>
                    <button
                      className={styles.mobileNavLink}
                      onClick={(e) => {
                        e.currentTarget.classList.toggle(styles.active);
                        const dropdown = e.currentTarget.nextElementSibling;
                        dropdown.classList.toggle(styles.show);
                      }}
                    >
                      {link.label}
                      <i className="bi bi-chevron-down"></i>
                    </button>
                    <ul className={styles.mobileDropdown}>
                      {link.items.map((item, idx) => (
                        <li key={idx}>
                          <Link
                            href={item.href}
                            className={
                              isActiveLink(item.href) ? styles.active : ""
                            }
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`${styles.mobileNavLink} ${isActiveLink(link.href) ? styles.active : ""}`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* <div className={styles.mobileMenuFooter}>
            <div className={styles.mobileContact}>
              <i className="bi bi-telephone-fill"></i>
              <span>+91 8148040202</span>
            </div>
            <div className={styles.mobileActions}>
              <Link href="/login" className={styles.mobileAction}>
                <i className="bi bi-person"></i>
                <span>My Account</span>
              </Link>
              <Link href="/profile">Profile</Link>
            </div>
          </div> */}
          <div className={styles.mobileMenuFooter}>
            <div className={styles.mobileContact}>
              <i className="bi bi-telephone-fill"></i>
              <span>+91 8148040202</span>
            </div>

            {isLoggedIn && user ? (
              <>
                {/* Added User Avatar Image for Mobile */}
                <div className={styles.mobileUserAvatarContainer}>
                  <img 
                    src="https://res.cloudinary.com/dsprfys3x/image/upload/v1774587999/business-man-avatar-vector_1133257-2430_djdkaj.avif"
                    alt="User Avatar"
                    className={styles.mobileUserAvatar}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", margin: "0 auto" }}
                  />
                </div>
                
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserDetails}>
                    <h5>
                      {user.first_name} {user.last_name}
                    </h5>
                    {/* Added Email Display for Mobile */}
                    {user.email && (
                      <p className={styles.mobileUserEmail}>
                        <i className="bi bi-envelope"></i> {user.email}
                      </p>
                    )}
                    <p>
                      <i className="bi bi-telephone"></i> {user.phone}
                    </p>
                  </div>
                </div>
                <div className={styles.mobileActions}>
                  {/* <Link href="/profile" className={styles.mobileAction}>
                    <i className="bi bi-person"></i>
                    <span>My Profile</span>
                  </Link> */}
                  {/* <Link href="/orders" className={styles.mobileAction}>
          <i className="bi bi-bag-check"></i>
          <span>My Orders</span>
        </Link> */}
                  {/* <Link
                    href="/cart"
                    className={`${styles.actionBtn} ${styles.cartBtn}`}
                  >
                    <div className={styles.cartIcon}>
                      <i className="bi bi-bag"></i>
                      {cartItemCount > 0 && (
                        <span className={styles.cartCount}>{cartItemCount}</span>
                      )}
                    </div>
                    <span className={`${styles.actionText} d-none d-md-inline`}>
                      Cart
                    </span>
                  </Link> */}

                  <button onClick={handleLogout} className={styles.mobileLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.mobileActions}>
                <Link href="/login" className={styles.mobileAction}>
                  <i className="bi bi-person"></i>
                  <span>Login</span>
                </Link>
                <Link href="/signup" className={styles.mobileAction}>
                  <i className="bi bi-person-plus"></i>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className={`${styles.mobileOverlay} d-lg-none`}
          onClick={toggleMenu}
        ></div>
      )}
    </header>
  );
};

export default Header;  