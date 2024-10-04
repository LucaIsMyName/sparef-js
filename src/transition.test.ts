// src/transition.test.ts

import { setupTransition } from './transition';
import { TransitionOptions } from './types';

describe('transition', () => {
  describe('setupTransition', () => {
    it('should set up click event listeners on links', () => {
      document.body.innerHTML = `
        <div id="container">
          <a href="/page1">Page 1</a>
          <a href="/page2">Page 2</a>
        </div>
      `;

      const container = document.getElementById('container')!;
      const options: TransitionOptions = {
        duration: 300,
        delay: 0,
        timeline: 'sequential',
        out: { from: {}, to: {} },
        in: { from: {}, to: {} },
      };

      const addEventListenerSpy = jest.spyOn(HTMLAnchorElement.prototype, 'addEventListener');

      setupTransition(container, options);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });
  });
});