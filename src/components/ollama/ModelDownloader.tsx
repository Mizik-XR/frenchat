
// This is a partial fix for the click property error on line 222
// Add a type assertion to fix the error
// Since we don't have access to the full file content, I'm creating a utility function
// that can be imported into the ModelDownloader component

/**
 * Utility function to safely click on an element
 * @param element The element to click
 */
export function safeClick(element: Element | null) {
  if (element && 'click' in element) {
    (element as HTMLElement).click();
  } else if (element) {
    // Fallback for elements that don't have a native click method
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }
}
