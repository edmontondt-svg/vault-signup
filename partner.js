
(() => {
  const cfg = JSON.parse(document.getElementById('partner-config').textContent);
  const SB = 'https://eajxkvtlcimyroblyvhh.supabase.co';
  const KEY = 'sb_publishable_dBEq3CFbH_JvIcIvqTelMA_03RrQwUK';
  const H = {'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'};
  const storageKey = 'sw-partner-claim:' + cfg.source;
  const params = new URLSearchParams(location.search);
  const scanKey = 'sw-partner-qr-scan:' + cfg.source;
  const qa = params.get('qa') === '1';
  const qrVisit = params.get('qr') === '1';
  const scanDay = new Date().toISOString().slice(0,10);
  const $ = (id) => document.getElementById(id);
  const first = (n) => (n || '').trim().split(/\s+/)[0] || '';
  const date = (d) => new Date(d).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'});
  const submitLabel = $('submit').textContent;

  if (!qa && qrVisit && localStorage.getItem(scanKey) !== scanDay) {
    localStorage.setItem(scanKey,scanDay);
    fetch(SB + '/rest/v1/vault_scan_log', {
      method:'POST', headers:{...H,'Prefer':'return=minimal'}, body:JSON.stringify({source:cfg.source})
    }).catch(() => {
      if (localStorage.getItem(scanKey) === scanDay) localStorage.removeItem(scanKey);
    });
  }

  const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  const directions = apple
    ? 'https://maps.apple.com/?q=Supplement+World+Newcastle&address=12440+167+Ave+NW,+Edmonton,+AB'
    : 'https://www.google.com/maps/search/?api=1&query=Supplement+World+Newcastle+12440+167+Ave+NW+Edmonton+AB';
  document.querySelectorAll('[data-directions]').forEach(a => a.href = directions);

  function showClaim(claim) {
    $('form-view').classList.add('hidden');
    $('claim-view').classList.remove('hidden');
    $('welcome').textContent = 'You’re in, ' + first(claim.name);
    $('claim-name').textContent = claim.name + ' · claimed ' + date(claim.at);
  }

  const saved = localStorage.getItem(storageKey);
  if (saved) { try { showClaim(JSON.parse(saved)); } catch (_) { localStorage.removeItem(storageKey); } }

  $('claim-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = $('full-name').value.trim();
    const phone = $('phone').value.trim();
    const email = $('email').value.trim();
    $('error').textContent = '';
    if (!full_name || !phone) { $('error').textContent = 'Name and phone number are required'; return; }
    const button = $('submit');
    button.disabled = true; button.textContent = 'Claiming…';
    try {
      const res = await fetch(SB + '/rest/v1/vault_signups', {
        method:'POST', headers:{...H,'Prefer':'return=minimal'},
        body:JSON.stringify({full_name,phone,email:email || null,source:cfg.source})
      });
      if (!res.ok) throw new Error('submit failed');
      const claim = {name:full_name,at:new Date().toISOString(),source:cfg.source};
      localStorage.setItem(storageKey, JSON.stringify(claim));
      showClaim(claim);
      window.scrollTo({top:0,behavior:'smooth'});
    } catch (_) {
      $('error').textContent = 'We could not save your claim. Check your connection and try again';
    } finally {
      button.disabled = false; button.textContent = submitLabel;
    }
  });

  $('reset').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    location.reload();
  });
})();
