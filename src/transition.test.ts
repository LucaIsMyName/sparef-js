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

describe("navigation and back transition", () => {
  let container: HTMLElement;
  let options: TransitionOptions;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = '<div id="container"><a href="/page1">Page 1</a></div>';
    container = document.getElementById("container")!;

    // Set up options
    options = {
      duration: 300,
      delay: 0,
      timeline: "sequential",
      easing: "ease-in-out",
      iterations: 1,
      out: { from: { opacity: 1 }, to: { opacity: 0 } },
      in: { from: { opacity: 0 }, to: { opacity: 1 } },
    };

    // Mock console.log
    originalConsoleLog = console.log;
    console.log = jest.fn();

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('<div id="container"><a href="/">Home</a></div>'),
      } as any)
    );

    // Mock pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    jest.spyOn(window.history, "pushState").mockImplementation((...args) => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: args[0] }));
      return originalPushState.apply(window.history, args);
    });
    jest.spyOn(window.history, "replaceState").mockImplementation((...args) => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: args[0] }));
      return originalReplaceState.apply(window.history, args);
    });

    // Setup the transition
    setupTransition(container, options, mockAnimate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.log = originalConsoleLog;
  });

  it("should use fallback transition when startViewTransition is not available", async () => {
    // Ensure startViewTransition is not available
    (document as any).startViewTransition = undefined;

    const link = container.querySelector("a") as HTMLAnchorElement;
    link.click();

    await new Promise((resolve) => setTimeout(resolve, options.duration + 50));

    expect(mockAnimate).toHaveBeenCalledTimes(4);
    expect(console.log).toHaveBeenCalledWith("performFallbackTransition called");
  });

  // it("should perform transition on navigation and back", async () => {
  //   // Wrap mockAnimate to log calls
  //   const wrappedMockAnimate = jest.fn((...args) => {
  //     console.log("mockAnimate called with:", args);
  //     return mockAnimate(...args);
  //   });

  //   // Setup the transition with the wrapped mock
  //   setupTransition(container, options, wrappedMockAnimate);

  //   // Trigger navigation
  //   const link = container.querySelector("a") as HTMLAnchorElement;
  //   link.click();

  //   // Wait for the transition to complete
  //   await new Promise((resolve) => setTimeout(resolve, options.duration + 50));

  //   console.log(`mockAnimate called ${wrappedMockAnimate.mock.calls.length} times after navigation`);

  //   // Check if animate was called for the navigation
  //   expect(wrappedMockAnimate).toHaveBeenCalledTimes(4);

  //   // Reset mock calls
  //   wrappedMockAnimate.mockClear();

  //   // Simulate going back
  //   window.history.back();

  //   // Wait for the back transition to complete
  //   await new Promise((resolve) => setTimeout(resolve, options.duration + 50));

  //   console.log(`mockAnimate called ${wrappedMockAnimate.mock.calls.length} times after back navigation`);

  //   // Check if animate was called again for the back navigation
  //   expect(wrappedMockAnimate).toHaveBeenCalledTimes(4);
  // });
});

describe("transition", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="container"><a href="/page1">Page 1</a></div>';
    // Reset mock counters
    mockAnimate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setupTransition", () => {
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

      // Mock startViewTransition to use our mockAnimate function
      (document as any).startViewTransition = jest.fn((callback) => {
        callback();
        mockAnimate(container, [], options);
        return { finished: Promise.resolve() };
      });

      setupTransition(container, options);

      const link = container.querySelector("a") as HTMLAnchorElement;
      link.click();

      // Wait for the transition to complete
      await new Promise((resolve) => setTimeout(resolve, options.duration + 100));

      const styleTags = document.head.getElementsByTagName("style");
      expect(styleTags.length).toBe(0);
      expect(mockAnimate).toHaveBeenCalledTimes(1);
    });
  });
});
