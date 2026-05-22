        function checkWolfLoomCompatibility() {
      const checks = {
        python313: () => {
          return navigator.userAgent.includes('Windows') || 
                 navigator.userAgent.includes('Linux') || 
                 navigator.userAgent.includes('Mac');
        },
        modernBrowser: () => {
          const ua = navigator.userAgent;
          return /Chrome\/(\d+)/.test(ua) && parseInt(RegExp.$1) >= 100 ||
                 /Firefox\/(\d+)/.test(ua) && parseInt(RegExp.$1) >= 115 ||
                 /Edg\/(\d+)/.test(ua) && parseInt(RegExp.$1) >= 120 ||
                 /Safari\/(\d+)/.test(ua) && parseInt(RegExp.$1) >= 18;
        },
        osSupported: () => {
          const ua = navigator.userAgent;
          return ua.includes('Windows NT') || 
                 ua.includes('Linux') || 
                 /Mac OS X \d+[._]\d+/.test(ua);
        },
        wasmSupport: () => {
          try {
            const canvas = document.createElement('canvas');
            return !!WebAssembly.instantiate;
          } catch {
            return false;
          }
        },
        architecture: () => {
          return !navigator.userAgent.includes('arm') || 
                 navigator.userAgent.includes('x86_64') ||
                 navigator.userAgent.includes('Win64');
        }
      };

      const results = {
        python313: checks.python313(),
        modernBrowser: checks.modernBrowser(),
        osSupported: checks.osSupported(),
        wasmSupport: checks.wasmSupport(),
        architecture: checks.architecture()
      };

      const isCompatible = Object.values(results).every(Boolean);
      
      return {
        compatible: isCompatible,
        details: results,
        checks: Object.keys(results)
      };
    }

    function updateButton(result) {
      const btn = document.getElementById('compatibilityBtn');
      const icon = document.getElementById('statusIcon');
      const text = document.getElementById('statusText');

      if (result.compatible) {
        btn.className = 'compatibility-btn compatible';
        icon.innerHTML = '<path d="M20 6L9 17l-5-5"/>';
        text.textContent = '';
      } else {
        btn.className = 'compatibility-btn incompatible';
        icon.innerHTML = '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>';
        text.textContent = '';
      }

      const failedChecks = result.checks.filter(check => !result.details[check]);
      btn.title = result.compatible 
        ? 'WolfLoom fully supported on this device'
        : `Missing: ${failedChecks.join(', ')}`;
    }

    document.addEventListener('DOMContentLoaded', () => {
      const result = checkWolfLoomCompatibility();
      updateButton(result);
    });

    window.addEventListener('resize', () => {
      const result = checkWolfLoomCompatibility();
      updateButton(result);
    });

function updateHeaderOffset() {
  const header = document.querySelector('.site-header');
  const marquee = document.querySelector('.marquee-container');

  const headerHeight = (header?.offsetHeight || 0) + (marquee?.offsetHeight || 0);

  document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
}

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const btn = document.getElementById("copy-btn");
  const code = document.getElementById("wolfloom-linux-setup");

  let resetTimer = null;

  function copyWolfloom() {
    navigator.clipboard.writeText(code.innerText).then(() => {
      clearTimeout(resetTimer);
      btn.classList.add("success");

      resetTimer = setTimeout(() => {
        btn.classList.remove("success");
      }, 1500);
    });
  }

  btn.addEventListener("click", copyWolfloom);
});

document.getElementById("copy-btn").addEventListener("click", (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  confetti({
    particleCount: 40,
    startVelocity: 20,
    spread: 60,
    origin: { x, y },
    colors: ["#7fc0ee"]
  });
});

window.addEventListener('load', updateHeaderOffset);

window.addEventListener('resize', updateHeaderOffset);

const downloadToggle = document.getElementById('downloadToggle');
const downloadPanel = document.getElementById('downloadPanel');

if (downloadToggle && downloadPanel) {
  downloadToggle.addEventListener('click', () => {
    downloadPanel.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!downloadPanel.contains(event.target) && !downloadToggle.contains(event.target)) {
      downloadPanel.classList.remove('open');
    }
  });
}

const warning = document.getElementById("downloadWarning");
const confirmBtn = document.getElementById("confirmDownload");
const cancelBtn = document.getElementById("cancelDownload");

let pendingDownload = null;

document.querySelectorAll(".download-option").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    pendingDownload = link.href;
    confirmBtn.href = pendingDownload;

     warning.classList.add("show");
  });
});

cancelBtn.addEventListener("click", () => {
  warning.classList.remove("show");
  pendingDownload = null;
});

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-tab');
    if (!target) return;

    tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
      btn.setAttribute('aria-selected', btn === button ? 'true' : 'false');
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === `tab-${target}`;
      panel.classList.toggle('active', isActive);
    });
  });
});

const featureCards = document.querySelectorAll('.feature-card');

if ('IntersectionObserver' in window && featureCards.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  featureCards.forEach((card) => observer.observe(card));
} else {
  featureCards.forEach((card) => card.classList.add('visible'));
}
