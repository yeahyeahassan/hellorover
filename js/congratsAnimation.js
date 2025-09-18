// Simple Confetti Animation for Celebration Banner
function createConfettiPiece() {
  const confetti = document.createElement('div');
  confetti.className = 'confetti-piece';
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.background = `hsl(${Math.random()*360}, 80%, 60%)`;
  confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
  document.body.appendChild(confetti);

  setTimeout(() => confetti.remove(), 3000);
}

function launchConfettiBurst() {
  for (let i = 0; i < 60; i++) {
    setTimeout(createConfettiPiece, i * 60);
  }
}

// Launch confetti when main content is shown
document.addEventListener('DOMContentLoaded', function () {
  const mainContent = document.getElementById('mainContent');
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mainContent.classList.contains('hidden')) {
        launchConfettiBurst();
        observer.disconnect();
      }
    });
  });
  observer.observe(mainContent, { attributes: true, attributeFilter: ['class'] });
});