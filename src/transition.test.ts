// src/transition.test.ts

import { setupTransition, generateStyleString, animate } from "./transition";
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

// describe("navigation and back transition", () => {
//   let container: HTMLElement;
//   let options: TransitionOptions;
//   let originalConsoleLog: typeof console.log;

//   beforeEach(() => {
//     // Set up the DOM
//     document.body.innerHTML = '<div id="container"><a href="/page1">Page 1</a></div>';
//     container = document.getElementById("container")!;

//     // Set up options
//     options = {
//       duration: 300,
//       delay: 0,
//       timeline: "sequential",
//       easing: "ease-in-out",
//       iterations: 1,
//       out: { from: { opacity: 1 }, to: { opacity: 0 } },
//       in: { from: { opacity: 0 }, to: { opacity: 1 } },
//     };

//     // Mock console.log
//     originalConsoleLog = console.log;
//     console.log = jest.fn();

//     // Mock fetch
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         text: () => Promise.resolve('<div id="container"><a href="/">Home</a></div>'),
//       } as any)
//     );

//     // Mock pushState and replaceState
//     const originalPushState = window.history.pushState;
//     const originalReplaceState = window.history.replaceState;
//     jest.spyOn(window.history, "pushState").mockImplementation((...args) => {
//       window.dispatchEvent(new PopStateEvent("popstate", { state: args[0] }));
//       return originalPushState.apply(window.history, args);
//     });
//     jest.spyOn(window.history, "replaceState").mockImplementation((...args) => {
//       window.dispatchEvent(new PopStateEvent("popstate", { state: args[0] }));
//       return originalReplaceState.apply(window.history, args);
//     });

//     // Setup the transition
//     setupTransition(container, options, mockAnimate);
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//     console.log = originalConsoleLog;
//   });

//   // it("should use fallback transition when startViewTransition is not available", async () => {
//   //   // Ensure startViewTransition is not available
//   //   (document as any).startViewTransition = undefined;

//   //   // Mock the animate function
//   //   const mockAnimateFunction = jest.fn().mockReturnValue({
//   //     finished: Promise.resolve(),
//   //   });

//   //   // Add a custom animation to test
//   //   animate('header', {
//   //     in: { from: { opacity: 0 }, to: { opacity: 1 } },
//   //     out: { from: { opacity: 1 }, to: { opacity: 0 } }
//   //   });

//   //   // Setup the transition with the mock animate function
//   //   setupTransition(container, options, mockAnimateFunction);

//   //   const link = container.querySelector("a") as HTMLAnchorElement;
//   //   link.click();

//   //   // Wait for the transition to complete
//   //   await new Promise((resolve) => setTimeout(resolve, options.duration + 50));

//   //   console.log('mockAnimateFunction call count:', mockAnimateFunction.mock.calls.length);
//   //   mockAnimateFunction.mock.calls.forEach((call, index) => {
//   //     console.log(`Call ${index + 1}:`, call[0].tagName, call[1], call[2]);
//   //   });

//   //   // Check if mockAnimateFunction was called 4 times (2 for container, 2 for custom animation)
//   //   expect(mockAnimateFunction).toHaveBeenCalledTimes(4);
//   //   expect(console.log).toHaveBeenCalledWith("performFallbackTransition called");

//   //   // Check specific calls
//   //   expect(mockAnimateFunction).toHaveBeenCalledWith(
//   //     expect.any(Element),
//   //     expect.arrayContaining([expect.objectContaining(options.out.from), expect.objectContaining(options.out.to)]),
//   //     expect.objectContaining({ duration: options.duration / 2 })
//   //   );
//   //   expect(mockAnimateFunction).toHaveBeenCalledWith(
//   //     expect.any(Element),
//   //     expect.arrayContaining([expect.objectContaining(options.in.from), expect.objectContaining(options.in.to)]),
//   //     expect.objectContaining({ duration: options.duration / 2 })
//   //   );
//   // });
// });

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

describe("animate function", () => {
  it("should set custom animations for specific selectors", async () => {
    const customAnimation = {
      in: {
        from: { transform: "translate(-100%)" },
        to: { transform: "translate(0)" },
      },
      out: {
        from: { transform: "translate(0)" },
        to: { transform: "translate(-100%)" },
      },
    };

    animate("header", customAnimation);

    // Setup transition
    document.body.innerHTML = '<div id="container"><header></header><a href="/test">Test</a></div>';
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

    // Ensure startViewTransition is not available to force fallback
    (document as any).startViewTransition = undefined;

    const mockAnimateFunction = jest.fn().mockReturnValue({
      finished: Promise.resolve(),
    });

    setupTransition(container, options, mockAnimateFunction);

    // Trigger a transition
    const link = container.querySelector("a") as HTMLAnchorElement;
    link.click();

    // Wait for the transition to complete
    await new Promise((resolve) => setTimeout(resolve, options.duration + 50));

    // Check if mockAnimateFunction was called with the custom animation for the header
    expect(mockAnimateFunction).toHaveBeenCalledWith(
      expect.any(Element),
      expect.arrayContaining([expect.objectContaining({ transform: "translate(0)" }), expect.objectContaining({ transform: "translate(-100%)" })]),
      expect.objectContaining({
        duration: 150, // Half of the total duration for sequential animation
        easing: "ease-in-out",
        fill: "forwards",
      })
    );

    // Check if mockAnimateFunction was called 4 times in total (2 for header, 2 for container)
    expect(mockAnimateFunction).toHaveBeenCalledTimes(4);
  });
});
