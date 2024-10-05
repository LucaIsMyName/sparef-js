// src/prefetch.test.ts

import { setupPrefetch } from "./prefetch";
import { PrefetchOptions } from "./types";

describe("prefetch", () => {
  describe("setupPrefetch", () => {
    it("should set up event listeners on links when active", () => {
      document.body.innerHTML = `
        <div id="container">
          <a href="/page1">Page 1</a>
          <a href="/page2">Page 2</a>
        </div>
      `;

      const container = document.getElementById("container")!;
      const options: PrefetchOptions = {
        active: true,
        event: "mouseover",
        delay: 0,
      };

      const addEventListenerSpy = jest.spyOn(HTMLAnchorElement.prototype, "addEventListener");

      setupPrefetch(container, options);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(addEventListenerSpy).toHaveBeenCalledWith("mouseover", expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it("should not set up event listeners when not active", () => {
      document.body.innerHTML = `
        <div id="container">
          <a href="/page1">Page 1</a>
          <a href="/page2">Page 2</a>
        </div>
      `;

      const container = document.getElementById("container")!;
      const options: PrefetchOptions = {
        active: false,
        event: "mouseover",
        delay: 0,
      };

      const addEventListenerSpy = jest.spyOn(HTMLAnchorElement.prototype, "addEventListener");

      setupPrefetch(container, options);

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });
});
