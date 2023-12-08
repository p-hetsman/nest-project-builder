export function resizableY(resizer: any) {
  resizer.addEventListener("mousedown", onmousedown);
  resizer.addEventListener("touchstart", ontouchstart);

  // for mobile
  function ontouchstart(e: TouchEvent) {
    e.preventDefault();
    resizer.addEventListener("touchmove", ontouchmove);
    resizer.addEventListener("touchend", ontouchend);
  }
  function ontouchmove(e: TouchEvent) {
    e.preventDefault();
    const { clientY } = e.touches[0];
    const deltaY = clientY - (resizer._clientY || clientY);
    resizer._clientY = clientY;
    const t = resizer.previousElementSibling;
    const b = resizer.nextElementSibling;
    // UP
    if (deltaY < 0) {
      const h = Math.round(parseInt(getComputedStyle(t).height) + deltaY);
      t.style.flex = `0 ${h < 10 ? 0 : h}px`;
      b.style.flex = "1 0";
    }
    // DOWN
    if (deltaY > 0) {
      const h = Math.round(parseInt(getComputedStyle(b).height) - deltaY);
      b.style.flex = `0 ${h < 10 ? 0 : h}px`;
      t.style.flex = "1 0";
    }
  }
  function ontouchend(e: any) {
    e.preventDefault();
    resizer.removeEventListener("touchmove", ontouchmove);
    resizer.removeEventListener("touchend", ontouchend);
    delete e._clientY;
  }

  // for desktop
  function onmousedown(e: MouseEvent) {
    if (e.cancelable) e.preventDefault();
    document.addEventListener("mousemove", onmousemove);
    document.addEventListener("mouseup", onmouseup);
  }
  function onmousemove(e: MouseEvent) {
    if (e.cancelable) e.preventDefault();
    const { clientY } = e;
    const deltaY = clientY - (resizer._clientY || clientY);
    resizer._clientY = clientY;
    const t = resizer.previousElementSibling;
    const b = resizer.nextElementSibling;
    // UP
    if (deltaY < 0) {
      const h = Math.round(parseInt(getComputedStyle(t).height) + deltaY);
      t.style.flex = `0 ${h < 10 ? 0 : h}px`;
      b.style.flex = "1 0";
    }
    // DOWN
    if (deltaY > 0) {
      const h = Math.round(parseInt(getComputedStyle(b).height) - deltaY);
      b.style.flex = `0 ${h < 10 ? 0 : h}px`;
      t.style.flex = "1 0";
    }
  }
  function onmouseup(e: any) {
    e.preventDefault();
    document.removeEventListener("mousemove", onmousemove);
    document.removeEventListener("mouseup", onmouseup);
    delete e._clientY;
  }
}
