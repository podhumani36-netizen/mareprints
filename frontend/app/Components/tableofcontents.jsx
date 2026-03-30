"use client";

import React, { useEffect, useState } from "react";
import "../assest/style/TableOfContents.css";

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const collectHeadings = () => {
      const headingElements = document.querySelectorAll(
        ".globe-blog h2, .globe-blog h3, .globe-blog h4",
      );

      const collectedHeadings = Array.from(headingElements).map((heading) => {
        if (!heading.id) {
          const id =
            heading.textContent
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") || `heading-${Math.random()}`;
          heading.id = id;
        }

        return {
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName[1]),
        };
      });

      setHeadings(collectedHeadings);
      return headingElements;
    };

    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    const headingElements = collectHeadings();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0px 0px -80% 0px",
        threshold: 0.1,
      },
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  const getIndentationClass = (level) => {
    switch (level) {
      case 2:
        return "toc-level-2";
      case 3:
        return "toc-level-3";
      case 4:
        return "toc-level-4";
      default:
        return "";
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="toc">
      <div
        className="toc-progress"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      <h2>Table of Contents</h2>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} className={getIndentationClass(heading.level)}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={activeId === heading.id ? "active" : ""}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
