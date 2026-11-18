/* Chalo Campus: shared motion script (scroll reveal, header shadow, page transitions, texture drift). */
(function () {
  var root = document.documentElement;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('mo', 'mo-intro');
  setTimeout(function () { root.classList.remove('mo-intro'); }, 1700);

  var SEL = 'main section > .wrap > *, main .grid > *, main .tiles > *, main .notes > *, main .split > *, #site-footer .foot-grid > *';
  var CONTAINER = '.grid,.tiles,.notes,.split';
  var POP = '.ticket,.card,.tile';
  var seen = new WeakSet();
  var initial = true;
  addEventListener('load', function () { setTimeout(function () { initial = false; }, 800); });
  setTimeout(function () { initial = false; }, 3500);

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el);
      el.setAttribute('data-rv', 'in');
      setTimeout(function () { if (el.getAttribute('data-rv') === 'in') { el.setAttribute('data-rv', 'done'); el.style.removeProperty('--d'); } }, 1100);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }) : null;

  function blocked(el) {
    if (el.closest('.site-header,.modal,.toast,[hidden]')) return true;
    var a = el.parentElement && el.parentElement.closest('[data-rv]');
    return !!(a && a.getAttribute('data-rv') !== 'done');
  }
  function scan(node) {
    if (node.nodeType !== 1 || !node.closest('main,#site-footer')) return;
    var list = [];
    if (node.matches(SEL)) list.push(node);
    Array.prototype.push.apply(list, node.querySelectorAll(SEL));
    list.forEach(function (el) {
      if (seen.has(el) || el.matches(CONTAINER) || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      seen.add(el);
      if (!initial) { if (el.matches(POP)) el.classList.add('mo-pop'); return; }
      if (!io || blocked(el)) return;
      var p = el.parentNode; p.__rvn = (p.__rvn || 0) + 1;
      el.style.setProperty('--d', Math.min(p.__rvn - 1, 5) * 0.08 + 's');
      el.setAttribute('data-rv', '');
      io.observe(el);
    });
  }
  new MutationObserver(function (recs) {
    recs.forEach(function (r) { r.addedNodes.forEach(scan); });
  }).observe(root, { childList: true, subtree: true });
  // safety net: never leave anything hidden
  setTimeout(function () {
    document.querySelectorAll('[data-rv=""]').forEach(function (el) { el.setAttribute('data-rv', 'in'); });
  }, 5000);

  // header shadow + texture drift
  var ticking = false, drift = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      root.classList.toggle('mo-scrolled', y > 8);
      if (drift) root.style.setProperty('--sy', y + 'px');
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // soft page transition between pages
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html?$|\/$/.test(u.pathname)) return;
    e.preventDefault();
    root.classList.add('mo-leave');
    setTimeout(function () { location.href = u.href; }, 180);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('mo-leave'); });
})();
