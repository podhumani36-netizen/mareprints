"use client";

import React from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

const Accordion = ({ items, allowMultiple = false }: AccordionProps) => {
  const accordionId = "customAccordion";

  return (
    <div className="accordion-section">
      <div className="accordion custom-animated-accordion" id={accordionId}>
        {items.map((item, index) => {
          const isOpen = index === 0;

          return (
            <div className="accordion-item" key={item.id}>
              <h5 className="accordion-header">
                <button
                  className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${item.id}`}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls={`collapse-${item.id}`}
                >
                  <span className="fw-semibold">{item.title}</span>
                  <div className="icon-box">
                    <div className="shutter-icon"></div>
                  </div>
                </button>
              </h5>
              <div
                id={`collapse-${item.id}`}
                className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                data-bs-parent={allowMultiple ? "" : `#${accordionId}`}
              >
                <div className="accordion-body">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accordion;