import {createStyles} from "./dom";
import {css} from "./template-literals";

/**
 * Styles the default scrollbar to be more pretty and less intrusive (especially on dark backgrounds), (similar to MacOS)
 */
export function prettyScrollbar(root: Element|undefined = document.head){
    return createStyles(css`
      ::-webkit-scrollbar
      {
        width: 8px;  /* for vertical scrollbars */
        height: 8px; /* for horizontal scrollbars */
      }
      ::-webkit-scrollbar-track
      {
        background: rgba(64, 64, 64, 0.4);
        border-radius: 6px;
      }
      ::-webkit-scrollbar-thumb
      {
        background: rgba(128, 128, 128, 0.2);
        border-radius: 6px;
      }
      ::-webkit-scrollbar-corner {background: rgba(0,0,0,0.5);}
    `, root)
}
