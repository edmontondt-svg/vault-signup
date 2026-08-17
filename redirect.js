(() => {
  const cfg = JSON.parse(document.getElementById('redirect-config').textContent);
  const SB = 'https://eajxkvtlcimyroblyvhh.supabase.co';
  const KEY = 'sb_publishable_dBEq3CFbH_JvIcIvqTelMA_03RrQwUK';
  const H = {'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'};
  const params = new URLSearchParams(location.search);
  const qrVisit = params.get('qr') === '1';
  const qa = params.get('qa') === '1';
  const qaScan = params.get('qa_scan') === '1';
  const scanSource = qaScan ? 'qa_' + cfg.source : cfg.source;
  const scanDay = new Date().toISOString().slice(0,10);
  const scanKey = 'sw-partner-qr-scan:' + scanSource;
  const status = document.getElementById('status');
  const direct = document.getElementById('direct');
  direct.href = cfg.destination;

  async function record() {
    if (!qrVisit || qa || localStorage.getItem(scanKey) === scanDay) return;
    localStorage.setItem(scanKey,scanDay);
    try {
      const res = await fetch(SB + '/rest/v1/vault_scan_log', {
        method:'POST',
        headers:{...H,'Prefer':'return=minimal'},
        body:JSON.stringify({source:scanSource}),
        keepalive:true
      });
      if (!res.ok) throw new Error('scan insert failed');
    } catch (_) {
      if (localStorage.getItem(scanKey) === scanDay) localStorage.removeItem(scanKey);
    }
  }

  if (qa || qaScan) {
    record().finally(() => {
      status.textContent = qaScan ? 'QA scan recorded' : 'QA mode · redirect paused';
      direct.textContent = 'Open verified destination';
    });
    return;
  }

  Promise.race([record(),new Promise(resolve => setTimeout(resolve,900))])
    .finally(() => location.replace(cfg.destination));
})();
