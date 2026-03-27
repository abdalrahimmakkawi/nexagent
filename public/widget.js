(function() {
  'use strict';
  
  var clientId = document.currentScript
    .getAttribute('data-client');
  if (!clientId) return;

  var baseUrl = 'https://nexagent-one.vercel.app';
  var isOpen = false;
  var iframe = null;

  // Styles
  var style = document.createElement('style');
  style.textContent = [
    '#nexagent-btn {',
    '  position: fixed;',
    '  bottom: 24px;',
    '  right: 24px;',
    '  width: 56px;',
    '  height: 56px;',
    '  border-radius: 50%;',
    '  background: #6366f1;',
    '  border: none;',
    '  cursor: pointer;',
    '  z-index: 999998;',
    '  box-shadow: 0 4px 24px rgba(99,102,241,0.4);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: transform 0.2s;',
    '}',
    '#nexagent-btn:hover { transform: scale(1.08); }',
    '#nexagent-btn svg { width: 24px; height: 24px; }',
    '#nexagent-frame {',
    '  position: fixed;',
    '  bottom: 96px;',
    '  right: 24px;',
    '  width: 380px;',
    '  height: 600px;',
    '  border: none;',
    '  border-radius: 16px;',
    '  z-index: 999999;',
    '  box-shadow: 0 8px 48px rgba(0,0,0,0.2);',
    '  display: none;',
    '  overflow: hidden;',
    '}',
    '@media (max-width: 480px) {',
    '  #nexagent-frame {',
    '    width: 100vw;',
    '    height: 100vh;',
    '    bottom: 0;',
    '    right: 0;',
    '    border-radius: 0;',
    '  }',
    '}',
  ].join('');
  document.head.appendChild(style);

  // Button
  var btn = document.createElement('button');
  btn.id = 'nexagent-btn';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="white" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 ' +
    '2-2h14a2 2 0 0 1 2 2z"/></svg>';
  document.body.appendChild(btn);

  // Toggle
  btn.addEventListener('click', function() {
    isOpen = !isOpen;
    
    if (isOpen) {
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'nexagent-frame';
        iframe.src = baseUrl + '/widget/' + clientId;
        iframe.allow = 'microphone';
        document.body.appendChild(iframe);
      }
      iframe.style.display = 'block';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" ' +
        'stroke="white" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"/>' +
        '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
    } else {
      if (iframe) iframe.style.display = 'none';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" ' +
        'stroke="white" stroke-width="1.5" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 ' +
        '2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  });
})();
