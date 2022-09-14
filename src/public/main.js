const PUBLIC_VAPID_KEY = 'BEZIfaRdkuYC7KUrTbgtjBbA7ZWp71eU805D9xvXu5wEKLnUJn6NzkiDKNoUoDeWVJIVopD329eWxaB_GG2MS_k';

const subscription = async() => {

  // Service worker
  const register = await navigator.serviceWorker.register('/worker.js', {
    scope: '/'
  });

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  })

  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  })
}

subscription();

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}