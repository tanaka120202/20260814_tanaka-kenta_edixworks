(() => {
  const form = document.querySelector('#reservation-form');
  if (!form) return;
  const name = form.elements.name;
  const phone = form.elements.phone;
  const success = document.querySelector('#reservation-success');
  const ticket = document.querySelector('#reservation-ticket');
  const counterKey = 'sato-clinic-demo-reception';
  let fallbackCounter = { day: '', number: 0 };
  let issuedDay = null;

  function today() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = type => parts.find(item => item.type === type).value;
    return {
      day: `${part('year')}-${part('month')}-${part('day')}`,
      label: new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(now)
    };
  }

  function refreshDate() {
    const current = today();
    if (issuedDay && issuedDay !== current.day) {
      issuedDay = null;
      ticket.textContent = '';
      success.hidden = true;
      form.hidden = false;
    }
    document.querySelectorAll('[data-reception-date]').forEach(element => { element.textContent = current.label; });
    return current;
  }

  function nextNumber(day) {
    let previous = fallbackCounter;
    try { previous = JSON.parse(sessionStorage.getItem(counterKey)) || previous; } catch { /* 保存できない場合は、このページ内だけで連番にする。 */ }
    const number = previous.day === day && Number.isSafeInteger(previous.number) && previous.number >= 0 && previous.number < Number.MAX_SAFE_INTEGER ? previous.number + 1 : 1;
    fallbackCounter = { day, number };
    // サンプル番号と受付日のみを保存し、氏名・電話番号などは保存しない。
    try { sessionStorage.setItem(counterKey, JSON.stringify(fallbackCounter)); } catch { /* 番号表示は保存機能なしでも動作する。 */ }
    return String(number).padStart(3, '0');
  }

  function validateName() {
    name.setCustomValidity(name.value.trim() ? '' : 'お名前をご入力ください。');
  }
  function validatePhone() {
    const value = phone.value.normalize('NFKC').replace(/[\s()-]/g, '');
    phone.setCustomValidity(/^(?:0\d{9,10}|\+\d{8,15})$/.test(value) ? '' : '電話番号を正しくご入力ください。例：090-1234-5678');
  }
  name.addEventListener('input', validateName);
  phone.addEventListener('input', validatePhone);
  form.addEventListener('submit', event => {
    event.preventDefault();
    validateName();
    validatePhone();
    if (!form.reportValidity()) return;
    const current = refreshDate();
    ticket.textContent = nextNumber(current.day);
    issuedDay = current.day;
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.querySelector('h3').focus();
  });
  document.querySelector('#reservation-retry').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    name.setCustomValidity('');
    phone.setCustomValidity('');
    name.focus();
  });
  form.querySelector('[type="submit"]').disabled = false;
  refreshDate();
  window.addEventListener('focus', refreshDate);
})();
