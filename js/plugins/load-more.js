document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.js-posts'); // posts container
  if (!list) return;

  const btn = document.getElementById('loadMore'); // load more button
  if (!btn) return;

  const btnRow = btn.closest('.col-lg-12') || btn.parentElement; // the button's column
  const BATCH = Number(list.dataset.batch || 4); // items per click

  // get columns that actually contain posts (keeps author-link sibling with each col)
  const getCols = () => Array.from(list.querySelectorAll('.col-lg-12')).filter(col => col.querySelector('.js-post'));

  // initial state: hide everything after initial batch
  let cols = getCols();
  cols.forEach((col, i) => { if (i >= BATCH) col.style.display = 'none'; });
  let shown = Math.min(BATCH, cols.length);

  // ensure the button row sits after the posts container (don't append into list)
  if (btnRow && list.parentNode) {
    list.parentNode.insertBefore(btnRow, list.nextSibling);
    btnRow.style.display = ''; // ensure visible
  }

  btn.addEventListener('click', () => {
    cols = getCols(); // recompute in case DOM changed
    const next = Math.min(shown + BATCH, cols.length);

    // reveal next batch and append them to the end of the posts container
    for (let i = shown; i < next; i++) {
      const col = cols[i];
      if (!col) continue;
      col.style.display = '';
      list.appendChild(col); // move to end so newly shown items appear before the button row
    }
    shown = next;

    // keep the button row after the posts list
    if (btnRow && list.parentNode) list.parentNode.insertBefore(btnRow, list.nextSibling);

    // keep button visible
    btn.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // disable button when done
    if (shown >= cols.length) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('mil-disabled');
    }
  });
});

