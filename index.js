class MastodonUser {
  constructor(user, host) {
    this.user = user;
    this.host = host;
  }
  toString() {
    return `@${this.user}@${this.host}`;
  }
  toHref() {
    return `https://${this.host}/@${this.user}`;
  }
  static fromString(handle) {
    if (!handle) return null;
    try {
      const u = new URL(handle);
      if (/^@[a-zA-Z0-9_]+$/.test(u.pathname)) {
        return new MastodonUser(u.pathname.substring(1), u.host);
      }
    } catch (e) { }
    const m = handle.match(/^@?([a-zA-Z0-9_]+)@([a-zA-Z0-9_\-.]+)$/);
    console.log(m);
    if (!m) return null;
    return new MastodonUser(m[1], m[2]);
  }
}
const copyThis = (el) => {
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.selectNode(el);
  sel.addRange(range);
  document.execCommand('copy');
  sel.removeAllRanges();
  el.style.backgroundColor = '#3ba164';
  requestAnimationFrame(() => {
    el.style.transition = 'background-color 0.4s';
    el.style.backgroundColor = 'transparent';
    setTimeout(() => {
      el.style.transition = '';
    }, 400);
  });
}

export default (doc) => {
  const updateDoc = (mastoHandle) => {
    const subs = {
      mastodonImport: !!mastoHandle && `https://${mastoHandle.host}/settings/import`,
      mastodonName: mastoHandle?.user,
      mastodonServer: mastoHandle?.host,
      mastodonHandle: mastoHandle?.toString(),
      mastodonLink: mastoHandle?.toHref(),
      mastodonMigrate: !!mastoHandle && `https://${mastoHandle.host}/settings/profile#:~:text=Move%20to%20a%20different%20account`,
    };
    const targets = [...doc.querySelectorAll('[data-content], [data-href], [data-if]')];
    targets.forEach(tgt => {
      if (tgt.getAttribute('data-href')) {
        if (!tgt.getAttribute('data-orig-href')) {
          tgt.setAttribute('data-orig-href', tgt.href);
        }
        tgt.href = subs[tgt.getAttribute('data-href')] ?? tgt.getAttribute('data-orig-href');
      }
      if (tgt.getAttribute('data-content')) {
        if (!tgt.getAttribute('data-orig-content')) {
          tgt.setAttribute('data-orig-content', tgt.innerHTML);
        }
        tgt.innerHTML = subs[tgt.getAttribute('data-content')] ?? tgt.getAttribute('data-orig-content');;
      }
      if (tgt.getAttribute('data-if')) {
        console.log('hi');
        tgt.style.display = subs[tgt.getAttribute('data-if')] ? '' : 'none';
      }
    });
  };
  const input = doc.querySelector('#mastodonHandle');
  input.value = localStorage.getItem('mastodonHandle') ?? "";
  updateDoc(MastodonUser.fromString(input.value));
  document.body.addEventListener('click', ({ target }) => {
    const copyWhat = target.closest('[data-click-to-copy]');
    if (copyWhat) {
      copyThis(copyWhat);
    }
  });
  input.addEventListener('keyup', ({ target }) => {
    const mastoHandle = MastodonUser.fromString(target.value);
    localStorage.setItem('mastodonHandle', mastoHandle?.toString() ?? "");
    updateDoc(mastoHandle);
  });
};