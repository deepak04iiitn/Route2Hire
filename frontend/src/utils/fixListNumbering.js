/**
 * Fixes numbering for ReactQuill nested ordered lists
 * ReactQuill uses ql-indent classes instead of nested lists,
 * so we need to manually number the items correctly
 */
export function fixListNumbering(container) {
  if (!container) return;

  // Find all ordered lists in the container
  const orderedLists = container.querySelectorAll('.prose ol, ol');
  
  orderedLists.forEach(ol => {
    // Get all direct child list items (not nested)
    const items = Array.from(ol.children).filter(
      el => el.tagName === 'LI'
    );
    
    // If no direct children, try querySelectorAll
    if (items.length === 0) {
      const allItems = ol.querySelectorAll('li');
      if (allItems.length === 0) return;
      items.push(...Array.from(allItems));
    }
    
    if (items.length === 0) return;

    // Reset counters
    const counters = {
      0: 0,  // base level
      1: 0,  // indent-1
      2: 0,  // indent-2
      3: 0,  // indent-3
    };

    // Get indent level from class
    function getIndentLevel(element) {
      if (!element) return 0;
      if (element.classList.contains('ql-indent-1')) return 1;
      if (element.classList.contains('ql-indent-2')) return 2;
      if (element.classList.contains('ql-indent-3')) return 3;
      if (element.classList.contains('ql-indent-4')) return 4;
      if (element.classList.contains('ql-indent-5')) return 5;
      if (element.classList.contains('ql-indent-6')) return 6;
      if (element.classList.contains('ql-indent-7')) return 7;
      if (element.classList.contains('ql-indent-8')) return 8;
      return 0;
    }

    items.forEach((item, index) => {
      const currentLevel = getIndentLevel(item);
      const prevItem = index > 0 ? items[index - 1] : null;
      const prevLevel = prevItem ? getIndentLevel(prevItem) : -1;

      // Reset counters when we encounter a level 0 item (new parent group)
      if (currentLevel === 0) {
        // Reset all nested level counters
        for (let level = 1; level <= 8; level++) {
          counters[level] = 0;
        }
        counters[0]++;
      } else {
        // Reset counters for deeper levels when we move to a different parent
        if (prevItem && currentLevel <= prevLevel) {
          // We've moved to a different parent or same level as previous
          // Reset all counters deeper than current level
          for (let level = currentLevel + 1; level <= 8; level++) {
            counters[level] = 0;
          }
          
          // If we're at the same or lower level than previous, reset current level counter
          // This handles the case when we go from indent-1 back to indent-1 under a new parent
          if (currentLevel < prevLevel) {
            counters[currentLevel] = 0;
          }
        }
        
        // Increment counter for current level
        counters[currentLevel]++;
      }

      // Determine the number format
      let number;
      let marker;
      
      if (currentLevel === 0) {
        number = counters[0];
        marker = `${number}.`;
      } else if (currentLevel === 1) {
        number = counters[1];
        marker = String.fromCharCode(96 + number) + '.'; // a, b, c...
      } else if (currentLevel === 2) {
        number = counters[2];
        marker = toRoman(number) + '.'; // i, ii, iii...
      } else {
        number = counters[currentLevel];
        marker = `${number}.`;
      }

      // Remove existing ::before content by removing any existing number element
      const existingNumber = item.querySelector('.list-number');
      if (existingNumber) {
        existingNumber.remove();
      }

      // Create a number element
      const numberEl = document.createElement('span');
      numberEl.className = 'list-number';
      numberEl.textContent = marker;
      numberEl.style.position = 'absolute';
      numberEl.style.left = currentLevel === 0 ? '0' : `${2.5 + (currentLevel - 1) * 1.5}rem`;
      numberEl.style.fontWeight = 'normal';
      
      // Ensure item has relative positioning
      if (getComputedStyle(item).position === 'static') {
        item.style.position = 'relative';
      }
      
      // Insert at the beginning
      if (item.firstChild) {
        item.insertBefore(numberEl, item.firstChild);
      } else {
        item.appendChild(numberEl);
      }
    });
  });
}

// Convert number to lowercase roman numerals
function toRoman(num) {
  if (num === 0) return '';
  
  const romanMap = [
    [1000, 'm'],
    [900, 'cm'],
    [500, 'd'],
    [400, 'cd'],
    [100, 'c'],
    [90, 'xc'],
    [50, 'l'],
    [40, 'xl'],
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i']
  ];

  let result = '';
  for (const [value, numeral] of romanMap) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

