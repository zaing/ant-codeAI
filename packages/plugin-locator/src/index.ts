import { createElement } from 'react';
import { render } from 'react-dom';
import { RunView } from './run';
import { allTargets } from './shared';
import { getElementInfo } from './adapters/getElementInfo';
import { goToLinkProps } from './functions/goTo';

import {
    ILowCodePluginContext,
} from '@firefly/auto-designer';
import { Locator } from './locator';

export const MAX_ZINDEX = 2147483647;

export default function init(cxt: ILowCodePluginContext) {
    if (typeof window === 'undefined' || typeof document == 'undefined') {
        return;
    }
    if (document.getElementById('locatorjs-wrapper')) {
        return;
    }
    const locator = new Locator();
    cxt.hotkey.bind('option', () => {
        locator.active = true;
    });

    cxt.hotkey.bind('option', () => {
        locator.active = false;
    }, 'keyup');

    const style = document.createElement('style');
    style.id = 'locator';
    style.innerHTML = `
    #locatorjs-layer {
      all: initial;
      pointer-events: none;
    }
    #locatorjs-layer * {
      box-sizing: border-box;
    }
    #locatorjs-labels-wrapper {
      display: flex;
      gap: 8px;
    }
    .locatorjs-tree-node:hover {
      background-color: #eee;
    }
  `;

  const globalStyle = document.createElement('style');
  globalStyle.id = 'locatorjs-global-style';
  globalStyle.innerHTML = `
      #locatorjs-wrapper {
        z-index: ${MAX_ZINDEX};
        pointer-events: none;
        position: fixed;
      }
      .locatorjs-active-pointer * {
        cursor: pointer !important;
      }
    `;

  const wrapper = document.createElement('div');
  wrapper.setAttribute('id', 'locatorjs-wrapper');

  const shadow = wrapper.attachShadow({ mode: 'open' });
  const layer = document.createElement('div');
  layer.setAttribute('id', 'locatorjs-layer');

  // wrapper.appendChild(style);
  // wrapper.appendChild(layer);
  shadow.appendChild(style);
  shadow.appendChild(layer);

  document.body.appendChild(wrapper);
  document.head.appendChild(globalStyle);

  function mouseOverListener(e: MouseEvent) {
    e.preventDefault();
    const { target } = e;
    if (target) {
        if (locator.active) {
            locator.active = true;
            locator.currentElement = target as HTMLElement;
        }
    }
  }
  function clickListener(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const elInfo = getElementInfo(locator.currentElement, undefined);
    console.log('**1***', elInfo);

    if (elInfo) {
      const linkProps = elInfo.thisElement.link;
      if (linkProps) {
        goToLinkProps(linkProps, allTargets, locator.ProjectOptions);
      }
    }
  }
  document.addEventListener('mouseover', mouseOverListener, {
    capture: true,
  });
  document.addEventListener('click', clickListener, { capture: true });
    setTimeout(() => {
        locator.iframeBox = (window.frames[0] as any).frameElement.getBoundingClientRect();
        window.frames[0].document.addEventListener('mouseover', mouseOverListener, {
            capture: true,
        });

        window.frames[0].document.addEventListener('click', clickListener, { capture: true });
    }, 1000);


  render(
    createElement(RunView, {
        locator,
        targets: allTargets,
    }),
    layer,
  );
}