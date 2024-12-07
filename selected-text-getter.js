; (function () {
    const selection = window.getSelection();
    return (selection.rangeCount > 0) ? selection.toString() : '';
})();