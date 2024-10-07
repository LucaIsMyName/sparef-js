// src/transition.test.ts

import { setupTransition, generateStyleString } from "./transition";
import { TransitionOptions, TransitionAnimation } from "./types";
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('<html><body><div id="content">New content</div></body></html>'),
  } as any)
);

// Mock animate function
const mockAnimate = jest.fn().mockReturnValue({
  finished: Promise.resolve(),
  cancel: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  reverse: jest.fn(),
  finish: jest.fn(),
});
describe("transition", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="container"><a href="/page1">Page 1</a></div>';
    // Mock the startViewTransition API
    (document as any).startViewTransition = jest.fn((callback) => {
      callback();
      return { finished: Promise.resolve() };
    });
    // Mock the animate function on Element
    Element.prototype.animate = mockAnimate;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setupTransition", () => {
    it("should handle browser back/forward navigation", async () => {
      const container = document.getElementById("container")!;
      const options: TransitionOptions = {
        duration: 300,
        delay: 0,
        timeline: "sequential",
        easing: "ease-in-out",
        iterations: 1,
        out: { from: {}, to: {} },
        in: { from: {}, to: {} },
      };

      setupTransition(container, options);

      // Simulate clicking a link
      const link = container.querySelector("a") as HTMLAnchorElement;
      link.click();

      // Wait for the transition to complete
      await new Promise((resolve) => setTimeout(resolve, options.duration + 100));

      // Simulate browser back button
      const popstateEvent = new Event("popstate");
      (popstateEvent as any).state = { href: "/" };
      window.dispatchEvent(popstateEvent);

      // Wait for the popstate event to be processed
      await new Promise((resolve) => setTimeout(resolve, options.duration + 100));

      expect(mockAnimate).toHaveBeenCalledTimes(4); // 2 for initial navigation, 2 for back navigation
    });
    it("should set up click event listeners on links", () => {
      const container = document.getElementById("container")!;
      const options: TransitionOptions = {
        duration: 300,
        delay: 0,
        timeline: "sequential",
        easing: "ease-in-out",
        iterations: 1,
        out: { from: {}, to: {} },
        in: { from: {}, to: {} },
      };

      const addEventListenerSpy = jest.spyOn(HTMLAnchorElement.prototype, "addEventListener");

      setupTransition(container, options);

      expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });
  });

  describe("generateStyleString", () => {
    it("should generate correct style strings", () => {
      const animation: TransitionAnimation = {
        from: { opacity: 1, transform: "translateY(0)" },
        to: { opacity: 0, transform: "translateY(-50px)" },
      };

      const result = generateStyleString(animation);

      expect(result.from).toBe("opacity: 1; transform: translateY(0);");
      expect(result.to).toBe("opacity: 0; transform: translateY(-50px);");
    });
  });

  describe("style tag cleanup", () => {
    it("should remove style tag after transition", async () => {
      document.body.innerHTML = `
        <div id="container">
          <a href="/page1">Page 1</a>
        </div>
      `;

      const container = document.getElementById("container")!;
      const options: TransitionOptions = {
        duration: 300,
        delay: 0,
        timeline: "sequential",
        easing: "ease-in-out",
        iterations: 1,
        out: { from: { opacity: 1 }, to: { opacity: 0 } },
        in: { from: { opacity: 0 }, to: { opacity: 1 } },
      };

      const mockAnimate = jest.fn().mockReturnValue({
        finished: Promise.resolve(),
      });

      setupTransition(container, options, mockAnimate);

      const link = container.querySelector("a") as HTMLAnchorElement;
      link.click();

      // Wait for the transition to complete
      await new Promise((resolve) => setTimeout(resolve, options.duration + 100));

      const styleTags = document.head.getElementsByTagName("style");
      expect(styleTags.length).toBe(0);
      expect(mockAnimate).toHaveBeenCalledTimes(2);
    });
  });
});
