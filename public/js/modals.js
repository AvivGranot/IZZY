function shareVia(platform) {
  const link = document.getElementById('personalLink').value;
  let url = '';
  if (platform === 'whatsapp') {
    url = `https://wa.me/?text=${encodeURIComponent(link)}`;
  } else if (platform === 'email') {
    url = `mailto:?subject=Try%20IZZY!&body=${encodeURIComponent(link)}`;
  } else if (platform === 'facebook') {
    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  } else if (platform === 'twitter') {
    url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Try IZZY! ' + link)}`;
  } else if (platform === 'reddit') {
    url = `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=Try%20IZZY!`;
  }
  if (url) window.open(url, '_blank');
}

function openShareModal() {
  const modal = document.getElementById('shareModal');
  modal.classList.remove('hidden');
  // Set personal link (could be user-specific, here just a placeholder)
  const link = window.location.origin + '/?ref=' + (window.userId || 'demo');
  document.getElementById('personalLink').value = link;
}

function closeShareModal() {
  document.getElementById('shareModal').classList.add('hidden');
}

function closeSubscribeModal() {
  const modal = document.getElementById('subscribeModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.shareVia = shareVia;
window.closeSubscribeModal = closeSubscribeModal;

function copyReferralLink() {
  const input = document.getElementById('personalLink');
  input.select();
  document.execCommand('copy');
  showToast('Link copied!');
}
window.copyReferralLink = copyReferralLink;
