"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { motion, useInView, animate, useAnimate, stagger } from "motion/react";
import styles from "./page.module.scss";

/**
 * AnimatedText - A component that reveals an `<h1>` with animated line or word-level transitions.
 * Perfect for high-impact hero headlines with a custom text reveal effect.
 */
const AnimatedText = ({
  text,
  className,
  id,
  delay = 0,
  once = true,
  opacity = 1,
  duration = 0.6,
  staggerDuration = 0.075,
  targetedElement = "line",
  ease = [0.76, 0, 0.24, 1],
}) => {
  // Refs for tracking the outer container and hidden measuring span
  const containerRef = useRef(null);
  const hiddenMeasureRef = useRef(null);

  // Motion hook for animating elements and getting a scoped selector
  const [scope, animate] = useAnimate();

  // State to hold split renderedLines and font load status
  const [renderedLines, setRenderedLines] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Track if the headline is in the viewport (and optionally only once)
  const inView = useInView(containerRef, { once });

  // Wait until fonts are loaded before measuring layout
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => setFontsLoaded(true))
        .catch(console.error);
    }
  }, []);

  // Once fonts are loaded, calculate line breaks and map into spans
  const rawLinesRef = useRef([]); // store the actual word strings in lines

  useLayoutEffect(() => {
    if (!fontsLoaded || !hiddenMeasureRef.current) return;

    const words = text.split(" ");
    hiddenMeasureRef.current.innerHTML = words
      .map(
        (word, index) =>
          `<span class='word' data-index='${index}'>${word} </span>`
      )
      .join("");

    const wordElements = Array.from(
      hiddenMeasureRef.current.querySelectorAll(".word")
    );

    const observer = new ResizeObserver(updateLines);
    observer.observe(hiddenMeasureRef.current);

    function arraysEqual(a, b) {
      return (
        a.length === b.length &&
        a.every(
          (line, i) => Array.isArray(line) && line.join(" ") === b[i]?.join(" ")
        )
      );
    }

    function updateLines() {
      let currentLineTop = null;
      let line = [];
      const newLines = [];

      wordElements.forEach((word) => {
        const { top } = word.getBoundingClientRect();
        if (currentLineTop === null) currentLineTop = top;
        if (top !== currentLineTop) {
          newLines.push(line);
          line = [];
          currentLineTop = top;
        }
        line.push(word.textContent.trim());
      });

      if (line.length) newLines.push(line);

      // Only update if layout changed
      if (!arraysEqual(newLines, rawLinesRef.current)) {
        rawLinesRef.current = newLines;

        if (targetedElement === "word") {
          // Animate by word
          setRenderedLines(
            newLines.map((lineWords, i) => (
              <span key={i} className="line wrapper_overflow">
                <motion.span
                  key={i}
                  className="line line_wrapper"
                  id={`line-${i}`}
                >
                  {lineWords.map((word, index) => (
                    <motion.span
                      key={`word-${i}`}
                      className="word word_wrapper"
                      initial={{ y: "100%" }}
                      exit={{ y: "100%" }}
                      transition={{
                        duration: 0.4,
                        delay: index * staggerDuration + delay,
                        ease,
                      }}
                    >
                      {Array.from(
                        word + (index < lineWords.length - 1 ? " " : "")
                      ).map((char, k) => (char === " " ? "\u00A0" : char))}
                      {index < lineWords.length - 1 && " "}
                    </motion.span>
                  ))}
                </motion.span>
              </span>
            ))
          );
        } else {
          // Animate by line
          setRenderedLines(
            newLines.map((lineWords, i) => (
              <span key={i} className="line wrapper_overflow">
                <motion.span
                  key={i}
                  className="line line_wrapper"
                  id={`line-${i}`}
                  initial={{ y: "100%" }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.4, delay: i * 0.1 + delay, ease }}
                >
                  {lineWords.map((word, index) =>
                    index + 1 === lineWords.length ? word : `${word} `
                  )}
                </motion.span>
              </span>
            ))
          );
        }
      }
    }

    updateLines();
    return () => observer.disconnect();
  }, [text, fontsLoaded, targetedElement]);

  // When the component is in view, animate all targeted elements into place
  useEffect(() => {
    if (inView && renderedLines.length > 0) {
      const elementsRef =
        targetedElement == "word" ? ".word_wrapper" : ".line_wrapper";
      animate(
        elementsRef,
        { y: 0 },
        {
          duration,
          delay: stagger(staggerDuration, { startDelay: delay }),
          ease,
        }
      );
    }
  }, [inView, renderedLines, targetedElement]);

  return (
    <h1
      style={{ opacity, position: "relative" }}
      ref={containerRef}
      id={id}
      aria-label={text}
      className={className}
    >
      {/* Actual animated renderedLines */}
      <span className={styles.text} ref={scope}>
        {renderedLines}
      </span>

      {/* Visually hidden placeholder to retain layout height */}
      <span className={styles.placeholder} aria-hidden="true">
        {text}
      </span>

      {/* Offscreen measurement element to detect line breaks */}
      <span
        ref={hiddenMeasureRef}
        className={styles.measure}
        aria-hidden="true"
      />
    </h1>
  );
};

export default AnimatedText;
